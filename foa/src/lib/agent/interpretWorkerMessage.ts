import type { InterpretedMessage, JobStatus, RequiredEvidence, WorkerIntent } from '@/lib/types';

export interface JobContext {
  jobTitle: string;
  currentStatus: JobStatus;
  requiredEvidence: RequiredEvidence[];
  collectedEvidence: RequiredEvidence[];
  workerName: string;
}

const VALID_INTENTS: WorkerIntent[] = [
  'accepts_job',
  'rejects_job',
  'confirms_en_route',
  'confirms_arrival',
  'sends_progress_update',
  'reports_issue',
  'asks_question',
  'confirms_completion',
  'sends_photo',
  'unclear',
];

/**
 * Interprets a free-text WhatsApp message from a field worker and decides
 * what should happen to the job. Tries an LLM call first (Claude); falls
 * back to a deterministic keyword classifier if no API key is configured,
 * so the MVP works end-to-end without external dependencies.
 */
export async function interpretWorkerMessage(
  message: string,
  jobContext: JobContext
): Promise<InterpretedMessage> {
  const raw = process.env.ANTHROPIC_API_KEY
    ? await interpretWithClaude(message, jobContext).catch(() => null)
    : null;

  const result = raw ?? heuristicInterpret(message);

  return applyBusinessRules(result, jobContext);
}

// ── LLM-based interpretation ────────────────────────────────────────────────

async function interpretWithClaude(message: string, ctx: JobContext): Promise<InterpretedMessage> {
  const model = process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-20241022';

  const systemPrompt = `Eres el motor de interpretación de FOA, un agente operativo que coordina trabajadores de campo por WhatsApp.
Tu única tarea es leer un mensaje de un trabajador y devolver un JSON con la interpretación. No agregues texto fuera del JSON.

Intenciones posibles: ${VALID_INTENTS.join(', ')}.

Contexto del trabajo:
- Título: ${ctx.jobTitle}
- Estado actual: ${ctx.currentStatus}
- Trabajador: ${ctx.workerName}
- Evidencia requerida: ${ctx.requiredEvidence.join(', ') || 'ninguna'}
- Evidencia ya recibida: ${ctx.collectedEvidence.join(', ') || 'ninguna'}

Devolvé exactamente este formato JSON:
{
  "intent": "<una de las intenciones>",
  "confidence": <numero entre 0 y 1>,
  "suggested_job_status": "<estado sugerido o null>",
  "should_escalate": <true|false>,
  "escalation_reason": "<motivo o null>",
  "suggested_reply": "<respuesta breve y profesional para enviarle al trabajador>",
  "summary_for_admin": "<resumen de una línea para el administrador>"
}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 400,
      system: systemPrompt,
      messages: [{ role: 'user', content: `Mensaje del trabajador: "${message}"` }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  const text: string = data?.content?.[0]?.text ?? '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON found in LLM response');

  const parsed = JSON.parse(jsonMatch[0]);
  return normalizeResult(parsed);
}

function normalizeResult(parsed: Record<string, unknown>): InterpretedMessage {
  const intent = VALID_INTENTS.includes(parsed.intent as WorkerIntent)
    ? (parsed.intent as WorkerIntent)
    : 'unclear';

  return {
    intent,
    confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
    suggested_job_status: (parsed.suggested_job_status as JobStatus) ?? null,
    should_escalate: Boolean(parsed.should_escalate),
    escalation_reason: (parsed.escalation_reason as string) ?? null,
    suggested_reply: (parsed.suggested_reply as string) ?? 'Recibido, gracias.',
    summary_for_admin: (parsed.summary_for_admin as string) ?? 'El trabajador envió una actualización.',
  };
}

// ── Heuristic fallback (no API key required) ────────────────────────────────

function heuristicInterpret(message: string): InterpretedMessage {
  const m = message.toLowerCase().trim();

  const matchers: Array<{ test: (s: string) => boolean; intent: WorkerIntent }> = [
    { test: (s) => /\b(acepto|aceptar|dale|si puedo|confirmo)\b/.test(s), intent: 'accepts_job' },
    { test: (s) => /\b(no puedo|rechazo|rechazar|no voy a poder|no llego)\b/.test(s), intent: 'rejects_job' },
    { test: (s) => /\b(en camino|saliendo|voy para alla|voy en camino)\b/.test(s), intent: 'confirms_en_route' },
    { test: (s) => /\b(ya llegue|llegue|llegué|estoy en el lugar)\b/.test(s), intent: 'confirms_arrival' },
    { test: (s) => /\b(hay un problema|no puedo continuar|me falta|tengo un inconveniente|problema)\b/.test(s), intent: 'reports_issue' },
    { test: (s) => /\b(termine|terminé|listo|finalice|finalizado|completado)\b/.test(s), intent: 'confirms_completion' },
    { test: (s) => /\b(avanzando|en proceso|trabajando en eso|ya empece|ya empecé)\b/.test(s), intent: 'sends_progress_update' },
    { test: (s) => /\b(foto|imagen|adjunto)\b/.test(s), intent: 'sends_photo' },
    { test: (s) => /\?$/.test(s) || /\b(como|cuando|donde|que necesito)\b/.test(s), intent: 'asks_question' },
  ];

  const match = matchers.find((m2) => m2.test(m));
  const intent = match?.intent ?? 'unclear';

  return buildFallbackResult(intent, message);
}

function buildFallbackResult(intent: WorkerIntent, message: string): InterpretedMessage {
  const base: Record<WorkerIntent, InterpretedMessage> = {
    accepts_job: {
      intent,
      confidence: 0.85,
      suggested_job_status: 'accepted',
      should_escalate: false,
      escalation_reason: null,
      suggested_reply: 'Perfecto, quedás asignado al trabajo. Te vamos a recordar antes del horario.',
      summary_for_admin: 'El trabajador aceptó el trabajo.',
    },
    rejects_job: {
      intent,
      confidence: 0.85,
      suggested_job_status: 'rejected',
      should_escalate: true,
      escalation_reason: 'El trabajador rechazó el trabajo, necesita reasignación.',
      suggested_reply: 'Entendido, gracias por avisar. Vamos a reasignar el trabajo.',
      summary_for_admin: 'El trabajador rechazó el trabajo. Requiere reasignación.',
    },
    confirms_en_route: {
      intent,
      confidence: 0.8,
      suggested_job_status: 'en_route',
      should_escalate: false,
      escalation_reason: null,
      suggested_reply: 'Genial, avisame cuando llegues y mandá una foto de llegada.',
      summary_for_admin: 'El trabajador está en camino.',
    },
    confirms_arrival: {
      intent,
      confidence: 0.85,
      suggested_job_status: 'arrived',
      should_escalate: false,
      escalation_reason: null,
      suggested_reply: 'Perfecto, gracias. Mandá una foto de llegada y avisame cuando estés avanzando.',
      summary_for_admin: 'El trabajador confirmó que llegó al lugar.',
    },
    sends_progress_update: {
      intent,
      confidence: 0.75,
      suggested_job_status: 'in_progress',
      should_escalate: false,
      escalation_reason: null,
      suggested_reply: 'Gracias por el update. Seguí así y avisame cuando termines.',
      summary_for_admin: 'El trabajador está avanzando con el trabajo.',
    },
    reports_issue: {
      intent,
      confidence: 0.8,
      suggested_job_status: 'blocked',
      should_escalate: true,
      escalation_reason: `El trabajador reportó un problema: "${message}"`,
      suggested_reply: 'Entendido. Ya aviso al administrador. Contame brevemente qué pasó y si necesitás algo para poder continuar.',
      summary_for_admin: 'El trabajador reportó un problema y el trabajo quedó bloqueado.',
    },
    asks_question: {
      intent,
      confidence: 0.6,
      suggested_job_status: null,
      should_escalate: false,
      escalation_reason: null,
      suggested_reply: 'Buena pregunta, dejame confirmarlo con el administrador y te respondo.',
      summary_for_admin: 'El trabajador hizo una pregunta que requiere respuesta del administrador.',
    },
    confirms_completion: {
      intent,
      confidence: 0.8,
      suggested_job_status: 'completed',
      should_escalate: false,
      escalation_reason: null,
      suggested_reply: 'Genial, gracias por confirmar. Cerramos el trabajo.',
      summary_for_admin: 'El trabajador confirmó que terminó el trabajo.',
    },
    sends_photo: {
      intent,
      confidence: 0.7,
      suggested_job_status: null,
      should_escalate: false,
      escalation_reason: null,
      suggested_reply: 'Recibido, gracias por la foto.',
      summary_for_admin: 'El trabajador envió evidencia fotográfica.',
    },
    unclear: {
      intent,
      confidence: 0.4,
      suggested_job_status: null,
      should_escalate: false,
      escalation_reason: null,
      suggested_reply: 'Disculpá, ¿podés contarme un poco más para entender bien la situación?',
      summary_for_admin: 'El mensaje del trabajador no fue claro, se pidió aclaración.',
    },
  };

  return base[intent];
}

// ── Business rules layer ────────────────────────────────────────────────────
// Applied regardless of whether the result came from the LLM or the
// heuristic fallback, so behavior stays consistent and auditable.

function applyBusinessRules(result: InterpretedMessage, ctx: JobContext): InterpretedMessage {
  if (result.intent === 'confirms_completion') {
    const missingEvidence = ctx.requiredEvidence.filter(
      (e) => e === 'final_photo' && !ctx.collectedEvidence.includes('final_photo')
    );

    if (missingEvidence.length > 0) {
      return {
        ...result,
        suggested_job_status: ctx.currentStatus === 'blocked' ? 'blocked' : 'in_progress',
        should_escalate: false,
        escalation_reason: null,
        suggested_reply: 'Antes de cerrar el trabajo necesitamos la foto final. ¿Podés mandarla?',
        summary_for_admin: 'El trabajador dice que terminó, pero falta la foto final para cerrar el trabajo.',
      };
    }
  }

  if (result.intent === 'unclear') {
    // Never let an unclear message override a status that's already in a
    // critical state (blocked / needs_admin_attention) — keep it for review.
    return { ...result, suggested_job_status: null };
  }

  return result;
}
