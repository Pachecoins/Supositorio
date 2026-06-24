import { listClients } from '@/lib/db/clients';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FormRow, Input, Label, Select, Textarea } from '@/components/ui/Field';
import { EVIDENCE_LABELS } from '@/lib/types';
import { createJobAction } from './actions';

export const dynamic = 'force-dynamic';

export default async function NewJobPage() {
  const clients = await listClients();

  return (
    <div>
      <PageHeader title="Nuevo trabajo" description="Definí el trabajo de campo a coordinar." />

      <div className="max-w-2xl px-8 py-6">
        <Card>
          <CardContent>
            <form action={createJobAction}>
              <FormRow>
                <Label htmlFor="title">Título</Label>
                <Input id="title" name="title" required placeholder="Jardinería en casa de Pilar" />
              </FormRow>
              <FormRow>
                <Label htmlFor="description">Descripción</Label>
                <Textarea id="description" name="description" rows={3} placeholder="Tareas a realizar" />
              </FormRow>
              <FormRow>
                <Label htmlFor="client_id">Cliente</Label>
                <Select id="client_id" name="client_id" required defaultValue="">
                  <option value="" disabled>
                    Seleccioná un cliente
                  </option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </FormRow>
              <FormRow>
                <Label htmlFor="address">Dirección</Label>
                <Input id="address" name="address" required placeholder="Av. Rivadavia 1450, Pilar" />
              </FormRow>
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="scheduled_date">Fecha</Label>
                  <Input id="scheduled_date" name="scheduled_date" type="date" />
                </div>
                <div>
                  <Label htmlFor="scheduled_time">Hora</Label>
                  <Input id="scheduled_time" name="scheduled_time" type="time" />
                </div>
              </div>
              <FormRow>
                <Label htmlFor="required_skills">Skills requeridas (separadas por coma)</Label>
                <Input id="required_skills" name="required_skills" placeholder="jardineria" />
              </FormRow>
              <FormRow>
                <Label htmlFor="priority">Prioridad</Label>
                <Select id="priority" name="priority" defaultValue="normal">
                  <option value="low">Baja</option>
                  <option value="normal">Normal</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </Select>
              </FormRow>
              <FormRow>
                <Label>Evidencia requerida</Label>
                <div className="flex flex-col gap-2 pt-1">
                  {Object.entries(EVIDENCE_LABELS).map(([value, label]) => (
                    <label key={value} className="flex items-center gap-2 text-sm text-zinc-300">
                      <input type="checkbox" name="required_evidence" value={value} className="accent-accent" />
                      {label}
                    </label>
                  ))}
                </div>
              </FormRow>
              <FormRow>
                <Label htmlFor="admin_notes">Notas internas</Label>
                <Textarea id="admin_notes" name="admin_notes" rows={3} placeholder="Notas solo visibles para el administrador" />
              </FormRow>
              <Button type="submit">Crear trabajo</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
