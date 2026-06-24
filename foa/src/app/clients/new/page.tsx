import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FormRow, Input, Label, Textarea } from '@/components/ui/Field';
import { createClientAction } from '../actions';

export default function NewClientPage() {
  return (
    <div>
      <PageHeader title="Nuevo cliente" description="Registrá un cliente para poder crearle trabajos." />

      <div className="max-w-2xl px-8 py-6">
        <Card>
          <CardContent>
            <form action={createClientAction}>
              <FormRow>
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" name="name" required placeholder="Familia Schiavoni" />
              </FormRow>
              <FormRow>
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" name="phone" required placeholder="+5491155667788" />
              </FormRow>
              <FormRow>
                <Label htmlFor="address">Dirección</Label>
                <Input id="address" name="address" required placeholder="Av. Rivadavia 1450, Pilar" />
              </FormRow>
              <FormRow>
                <Label htmlFor="notes">Notas</Label>
                <Textarea id="notes" name="notes" rows={3} placeholder="Observaciones internas" />
              </FormRow>
              <Button type="submit">Crear cliente</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
