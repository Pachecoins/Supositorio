import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FormRow, Input, Label, Textarea } from '@/components/ui/Field';
import { createWorkerAction } from '../actions';

export default function NewWorkerPage() {
  return (
    <div>
      <PageHeader title="Nuevo trabajador" description="Registrá un trabajador de campo para poder asignarle trabajos." />

      <div className="max-w-2xl px-8 py-6">
        <Card>
          <CardContent>
            <form action={createWorkerAction}>
              <FormRow>
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" name="name" required placeholder="Juan Pérez" />
              </FormRow>
              <FormRow>
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" name="phone" required placeholder="+5491122334455" />
              </FormRow>
              <FormRow>
                <Label htmlFor="zone">Zona</Label>
                <Input id="zone" name="zone" required placeholder="Pilar" />
              </FormRow>
              <FormRow>
                <Label htmlFor="skills">Skills (separados por coma)</Label>
                <Input id="skills" name="skills" placeholder="jardineria, paisajismo" />
              </FormRow>
              <FormRow>
                <Label htmlFor="availability">Disponibilidad</Label>
                <Input id="availability" name="availability" placeholder="Lunes a viernes, 8 a 17hs" />
              </FormRow>
              <FormRow>
                <Label htmlFor="rate">Tarifa</Label>
                <Input id="rate" name="rate" type="number" step="0.01" placeholder="6500" />
              </FormRow>
              <FormRow>
                <Label htmlFor="notes">Notas</Label>
                <Textarea id="notes" name="notes" rows={3} placeholder="Observaciones internas" />
              </FormRow>
              <Button type="submit">Crear trabajador</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
