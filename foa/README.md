# FOA — FieldOpsAgent

> Concepto interno: **Recursos No Humanos**. Un agente operativo que coordina trabajadores de campo por WhatsApp: asigna trabajos, manda instrucciones, controla progreso, pide evidencia, registra estados y escala al administrador cuando hace falta.

Este MVP es una app web para que un administrador gestione todo el ciclo de un trabajo de campo, con un simulador de WhatsApp incorporado para probar el flujo completo sin depender de Meta.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| UI | Tailwind CSS |
| Base de datos | Supabase / PostgreSQL |
| Storage | Supabase Storage (evidencia fotográfica) |
| Backend | Server Actions de Next.js |
| IA | Claude (Anthropic API), con fallback heurístico sin API key |
| Canal de mensajería | WhatsApp Simulator interno (preparado para WhatsApp Cloud API) |

## Estructura del proyecto

```
foa/
├── supabase/
│   ├── schema.sql        → esquema completo (tablas, enums, índices, bucket de storage)
│   └── seed.sql          → datos de ejemplo (3 trabajadores, 2 clientes, 3 trabajos)
├── src/
│   ├── app/
│   │   ├── page.tsx              → Dashboard
│   │   ├── workers/               → CRUD de trabajadores
│   │   ├── clients/               → CRUD de clientes
│   │   ├── jobs/                  → listado, alta y detalle de trabajos
│   │   │   ├── [id]/page.tsx      → pantalla principal: timeline + simulador + acciones
│   │   │   └── actions.ts         → server actions: ofertar, recordar, simular respuesta, escalar...
│   ├── components/
│   │   ├── ui/                    → Button, Card, Badge, Field
│   │   ├── layout/                → Sidebar, PageHeader
│   │   └── jobs/                  → JobActions, AssignWorkerForm, WhatsappPanel, JobTimeline
│   └── lib/
│       ├── types.ts                → tipos de dominio (Worker, Client, Job, JobUpdate, MessageLog...)
│       ├── supabase/                → clientes de Supabase (server/browser)
│       ├── db/                     → queries (workers, clients, jobs, jobUpdates, messageLogs)
│       └── agent/
│           ├── interpretWorkerMessage.ts  → interpretación IA + reglas de negocio
│           └── templates.ts               → templates de mensajes de WhatsApp
```

## Setup

### 1. Crear el proyecto en Supabase

1. Creá un proyecto en [supabase.com](https://supabase.com).
2. Abrí el SQL Editor y ejecutá `supabase/schema.sql`.
3. Opcionalmente, ejecutá `supabase/seed.sql` para cargar datos de ejemplo.
4. Copiá la URL del proyecto y las keys (`service_role` y `anon`) desde *Project Settings → API*.

### 2. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Completá `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

`ANTHROPIC_API_KEY` es opcional: si no se configura, el agente usa un clasificador heurístico por palabras clave para interpretar las respuestas del trabajador, así el MVP funciona de punta a punta sin dependencias externas.

### 3. Instalar dependencias y correr

```bash
cd foa
pnpm install   # o npm install
pnpm dev
```

La app queda disponible en `http://localhost:3000`.

## Flujo principal

1. Crear trabajadores (`/workers/new`) y clientes (`/clients/new`).
2. Crear un trabajo (`/jobs/new`) y asignarle un trabajador desde el detalle del trabajo.
3. Desde **Acciones**, ofrecer el trabajo — esto genera el mensaje de oferta y lo registra en el WhatsApp Simulator.
4. Simular la respuesta del trabajador desde el panel de WhatsApp (hay respuestas rápidas: *Acepto, No puedo, Estoy en camino, Ya llegué, Estoy avanzando, Hay un problema, Terminé* — o cualquier texto libre).
5. El agente (`interpretWorkerMessage`) interpreta el mensaje, actualiza el estado del trabajo, registra el evento en el timeline y genera la siguiente respuesta sugerida.
6. Si detecta un rechazo, un problema o un mensaje ambiguo persistente, el trabajo pasa a **needs_admin_attention** y aparece en las alertas del dashboard.

## Lógica del agente

`interpretWorkerMessage(message, jobContext)` devuelve:

```json
{
  "intent": "confirms_arrival",
  "confidence": 0.94,
  "suggested_job_status": "arrived",
  "should_escalate": false,
  "escalation_reason": null,
  "suggested_reply": "Perfecto, gracias. Mandá una foto de llegada y avisame cuando estés avanzando.",
  "summary_for_admin": "El trabajador confirmó que llegó al lugar."
}
```

Reglas de negocio aplicadas después de la interpretación (en `interpretWorkerMessage.ts`):

- Acepta → `accepted`.
- Rechaza → escalamiento, el trabajo pasa a `needs_admin_attention`.
- Confirma llegada → `arrived`.
- Manda avance → `in_progress`.
- Reporta un problema → escalamiento, `needs_admin_attention`.
- Confirma que terminó pero falta la foto final → no se cierra el trabajo, se le pide la evidencia faltante.
- Mensaje ambiguo → no cambia el estado, pide aclaración.

Toda interacción queda registrada en `job_updates` (timeline) y `message_logs` (historial de mensajes).

## Integración futura con WhatsApp Cloud API

El MVP usa el **WhatsApp Simulator** (`channel: whatsapp_simulator`) para no depender de Meta durante el desarrollo. El modelo de datos ya distingue el canal (`whatsapp_simulator` vs `whatsapp_cloud_api`), así que conectar el canal real implica:

1. Configurar las variables `WHATSAPP_CLOUD_API_*` en `.env.local`.
2. Reemplazar las llamadas a `createMessageLog` con channel `whatsapp_simulator` por el envío real vía Cloud API en `src/app/jobs/actions.ts`.
3. Agregar un webhook (`/api/whatsapp/webhook`) que reciba los mensajes entrantes y llame a `simulateWorkerReplyAction` (o su equivalente) con el contenido real.

## Estados del trabajo

`draft → offered → accepted → scheduled → reminder_sent → en_route → arrived → in_progress → completed`

Con bifurcaciones a `rejected`, `blocked`, `needs_admin_attention` o `cancelled` según la respuesta del trabajador.
