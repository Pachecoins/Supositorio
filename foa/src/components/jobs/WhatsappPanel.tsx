'use client';

import { useRef, useState, useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { cn, formatDateTime } from '@/lib/utils';
import type { MessageLog } from '@/lib/types';
import { simulateWorkerReplyAction } from '@/app/jobs/actions';

const QUICK_REPLIES = ['Acepto', 'No puedo', 'Estoy en camino', 'Ya llegué', 'Estoy avanzando', 'Hay un problema', 'Terminé'];

export function WhatsappPanel({ jobId, workerName, messages }: { jobId: string; workerName: string | null; messages: MessageLog[] }) {
  const [draft, setDraft] = useState('');
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function send(text: string) {
    const value = text.trim();
    if (!value) return;
    startTransition(async () => {
      await simulateWorkerReplyAction(jobId, value);
      setDraft('');
    });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-zinc-500">Todavía no hay mensajes en este trabajo.</p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={cn('flex', msg.direction === 'outbound' ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                msg.direction === 'outbound' ? 'bg-accent text-white' : 'bg-panel2 text-zinc-100 border border-border'
              )}
            >
              <p>{msg.content}</p>
              <p className={cn('mt-1 text-[10px]', msg.direction === 'outbound' ? 'text-white/70' : 'text-zinc-500')}>
                {formatDateTime(msg.created_at)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border px-4 py-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {QUICK_REPLIES.map((reply) => (
            <button
              key={reply}
              type="button"
              disabled={isPending || !workerName}
              onClick={() => send(reply)}
              className="rounded-full border border-border px-2.5 py-1 text-xs text-zinc-400 hover:border-accent hover:text-white disabled:opacity-40"
            >
              {reply}
            </button>
          ))}
        </div>

        <form
          ref={formRef}
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send(draft);
          }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={!workerName}
            placeholder={workerName ? `Simular respuesta de ${workerName}...` : 'Asigná un trabajador para simular respuestas'}
            className="flex-1 rounded-md border border-border bg-panel2 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-accent focus:outline-none disabled:opacity-50"
          />
          <Button type="submit" disabled={isPending || !workerName}>
            Enviar
          </Button>
        </form>
      </div>
    </div>
  );
}
