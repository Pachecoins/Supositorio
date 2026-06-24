-- FOA — FieldOpsAgent
-- Seed data: 3 workers, 2 clients, 3 jobs.
-- Run after schema.sql.

insert into workers (id, name, phone, zone, skills, availability, rate, trust_score, status, notes) values
  ('11111111-1111-1111-1111-111111111111', 'Juan Pérez', '+5491122334455', 'Pilar', array['jardineria', 'paisajismo'], 'Lunes a viernes, 8 a 17hs', 6500.00, 0.92, 'available', 'Muy puntual, buen trato con clientes.'),
  ('22222222-2222-2222-2222-222222222222', 'Martín López', '+5491133445566', 'CABA', array['mantenimiento_general', 'plomeria', 'electricidad_basica'], 'Lunes a sábado, 9 a 18hs', 7200.00, 0.85, 'available', 'Resuelve bien imprevistos.'),
  ('33333333-3333-3333-3333-333333333333', 'Lucas Gómez', '+5491144556677', 'Zona Norte', array['instalaciones', 'electricidad', 'redes'], 'Martes a sábado, 10 a 19hs', 8000.00, 0.78, 'available', 'Nuevo en la plataforma, en seguimiento.');

insert into clients (id, name, phone, address, notes) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Familia Schiavoni', '+5491155667788', 'Av. Rivadavia 1450, Pilar, Buenos Aires', 'Cliente recurrente, prefiere visitas a la mañana.'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Consorcio Palermo 2200', '+5491166778899', 'Av. Santa Fe 2200, Palermo, CABA', 'Acceso por portería, avisar al encargado del edificio.');

insert into jobs (
  id, title, description, client_id, address, scheduled_date, scheduled_time,
  required_skills, assigned_worker_id, status, priority, required_evidence, admin_notes
) values
  (
    'c1111111-1111-1111-1111-111111111111',
    'Jardinería en casa de Pilar',
    'Corte de césped, poda de arbustos y limpieza general del jardín delantero y trasero.',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Av. Rivadavia 1450, Pilar, Buenos Aires',
    current_date + 1,
    '09:00',
    array['jardineria'],
    '11111111-1111-1111-1111-111111111111',
    'scheduled',
    'normal',
    array['arrival_photo', 'final_photo'],
    'Cliente pidió que no corten las plantas nuevas del fondo.'
  ),
  (
    'c2222222-2222-2222-2222-222222222222',
    'Reparación menor en departamento de Palermo',
    'Arreglo de pérdida en cañería de baño y ajuste de puerta de cocina.',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Av. Santa Fe 2200, Palermo, CABA',
    current_date + 2,
    '14:00',
    array['plomeria', 'mantenimiento_general'],
    '22222222-2222-2222-2222-222222222222',
    'draft',
    'high',
    array['arrival_photo', 'progress_photo', 'final_photo'],
    null
  ),
  (
    'c3333333-3333-3333-3333-333333333333',
    'Instalación liviana en oficina de Vicente López',
    'Instalación de 4 puntos de red y 2 tomas eléctricas adicionales en sala de reuniones.',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Av. Maipú 1900, Vicente López, Buenos Aires',
    current_date + 3,
    '11:00',
    array['instalaciones', 'electricidad', 'redes'],
    '33333333-3333-3333-3333-333333333333',
    'draft',
    'normal',
    array['final_photo'],
    null
  );
