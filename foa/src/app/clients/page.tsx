import Link from 'next/link';
import { listClients } from '@/lib/db/clients';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  const clients = await listClients();

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Clientes para los que se coordinan trabajos de campo."
        actions={
          <Link href="/clients/new">
            <Button>+ Nuevo cliente</Button>
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
                <th className="px-4 py-3">Dirección</th>
                <th className="px-4 py-3">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {clients.map((c) => (
                <tr key={c.id} className="hover:bg-panel2/50">
                  <td className="px-4 py-3 font-medium text-white">{c.name}</td>
                  <td className="px-4 py-3 text-zinc-400">{c.phone}</td>
                  <td className="px-4 py-3 text-zinc-400">{c.address}</td>
                  <td className="px-4 py-3 text-zinc-400">{c.notes ?? '—'}</td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                    Todavía no hay clientes registrados.
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
