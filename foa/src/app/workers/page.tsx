import Link from 'next/link';
import { listWorkers } from '@/lib/db/workers';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { WorkerStatusBadge } from '@/components/ui/Badge';
import { WORKER_STATUS_LABELS } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function WorkersPage() {
  const workers = await listWorkers();

  return (
    <div>
      <PageHeader
        title="Trabajadores"
        description="Equipo de campo disponible para asignar a trabajos."
        actions={
          <Link href="/workers/new">
            <Button>+ Nuevo trabajador</Button>
          </Link>
        }
      />

      <div className="px-8 py-6">
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-panel2 text-left text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Teléfono</th>
                <th className="px-4 py-3">Zona</th>
                <th className="px-4 py-3">Skills</th>
                <th className="px-4 py-3">Trust score</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {workers.map((w) => (
                <tr key={w.id} className="hover:bg-panel2/50">
                  <td className="px-4 py-3">
                    <Link href={`/workers/${w.id}`} className="font-medium text-white hover:text-accent">
                      {w.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{w.phone}</td>
                  <td className="px-4 py-3 text-zinc-400">{w.zone}</td>
                  <td className="px-4 py-3 text-zinc-400">{w.skills.join(', ')}</td>
                  <td className="px-4 py-3 text-zinc-400">{(w.trust_score * 100).toFixed(0)}%</td>
                  <td className="px-4 py-3">
                    <WorkerStatusBadge status={w.status} label={WORKER_STATUS_LABELS[w.status]} />
                  </td>
                </tr>
              ))}
              {workers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                    Todavía no hay trabajadores registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
