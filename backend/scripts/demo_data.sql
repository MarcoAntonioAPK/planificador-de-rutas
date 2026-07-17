-- Datos de demostración para PostgreSQL. Ejecutar después de `python manage.py migrate`.
-- Todas las cuentas de este script usan la contraseña Temporal2026.
BEGIN;

INSERT INTO operations_company (name, slug, is_active, primary_color, secondary_color, accent_color, logo_url, created_at)
VALUES
  ('Salzillo', 'salzillo', true, '#7C3AED', '#1E1B4B', '#F59E0B', '', now()),
  ('Transportes', 'transportes', true, '#0369A1', '#082F49', '#10B981', '', now())
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO users_user (password, last_login, is_superuser, first_name, last_name, is_staff, is_active, date_joined, email, name, phone, created_at, updated_at)
VALUES
  ('pbkdf2_sha256$1000000$planificador2026$soOQVpq5ar8kOLhWk99K4dkGUkJ3IjJwsbQ9Ehrd0/E=', NULL, false, '', '', false, true, now(), 'salzillo_admin@gmail.com', 'Admin Salzillo', '+52 614 100 0001', now(), now()),
  ('pbkdf2_sha256$1000000$planificador2026$soOQVpq5ar8kOLhWk99K4dkGUkJ3IjJwsbQ9Ehrd0/E=', NULL, false, '', '', false, true, now(), 'transportes@gmail.com', 'Admin Transportes', '+52 81 1000 0001', now(), now()),
  ('pbkdf2_sha256$1000000$planificador2026$soOQVpq5ar8kOLhWk99K4dkGUkJ3IjJwsbQ9Ehrd0/E=', NULL, false, '', '', false, true, now(), 'planificador1@salzillo.mx', 'Ana Torres', '+52 614 100 0011', now(), now()),
  ('pbkdf2_sha256$1000000$planificador2026$soOQVpq5ar8kOLhWk99K4dkGUkJ3IjJwsbQ9Ehrd0/E=', NULL, false, '', '', false, true, now(), 'planificador2@salzillo.mx', 'Luis García', '+52 614 100 0012', now(), now()),
  ('pbkdf2_sha256$1000000$planificador2026$soOQVpq5ar8kOLhWk99K4dkGUkJ3IjJwsbQ9Ehrd0/E=', NULL, false, '', '', false, true, now(), 'chofer1@salzillo.mx', 'José Ríos', '+52 614 100 0021', now(), now()),
  ('pbkdf2_sha256$1000000$planificador2026$soOQVpq5ar8kOLhWk99K4dkGUkJ3IjJwsbQ9Ehrd0/E=', NULL, false, '', '', false, true, now(), 'chofer2@salzillo.mx', 'Mario Cruz', '+52 614 100 0022', now(), now()),
  ('pbkdf2_sha256$1000000$planificador2026$soOQVpq5ar8kOLhWk99K4dkGUkJ3IjJwsbQ9Ehrd0/E=', NULL, false, '', '', false, true, now(), 'planificador1@transportes.mx', 'Elena Ruiz', '+52 81 1000 0011', now(), now()),
  ('pbkdf2_sha256$1000000$planificador2026$soOQVpq5ar8kOLhWk99K4dkGUkJ3IjJwsbQ9Ehrd0/E=', NULL, false, '', '', false, true, now(), 'planificador2@transportes.mx', 'Carlos Solís', '+52 81 1000 0012', now(), now()),
  ('pbkdf2_sha256$1000000$planificador2026$soOQVpq5ar8kOLhWk99K4dkGUkJ3IjJwsbQ9Ehrd0/E=', NULL, false, '', '', false, true, now(), 'chofer1@transportes.mx', 'Rosa Lara', '+52 81 1000 0021', now(), now()),
  ('pbkdf2_sha256$1000000$planificador2026$soOQVpq5ar8kOLhWk99K4dkGUkJ3IjJwsbQ9Ehrd0/E=', NULL, false, '', '', false, true, now(), 'chofer2@transportes.mx', 'Pedro León', '+52 81 1000 0022', now(), now())
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone, updated_at = now();

INSERT INTO operations_membership (company_id, user_id, role_id, supervisor_id, is_active, created_at)
SELECT c.id, u.id, r.id, NULL, true, now()
FROM (VALUES
 ('salzillo','salzillo_admin@gmail.com','admin'), ('transportes','transportes@gmail.com','admin'),
 ('salzillo','planificador1@salzillo.mx','planner'), ('salzillo','planificador2@salzillo.mx','planner'),
 ('salzillo','chofer1@salzillo.mx','driver'), ('salzillo','chofer2@salzillo.mx','driver'),
 ('transportes','planificador1@transportes.mx','planner'), ('transportes','planificador2@transportes.mx','planner'),
 ('transportes','chofer1@transportes.mx','driver'), ('transportes','chofer2@transportes.mx','driver')
) AS seed(company_slug,email,role_code)
JOIN operations_company c ON c.slug=seed.company_slug JOIN users_user u ON u.email=seed.email JOIN users_role r ON r.code=seed.role_code
ON CONFLICT (company_id,user_id) DO UPDATE SET role_id=EXCLUDED.role_id, is_active=true;

-- Cada chofer queda ligado a un planificador de su misma empresa.
UPDATE operations_membership driver SET supervisor_id=planner.id
FROM users_user du, operations_membership planner, users_user pu
WHERE du.id=driver.user_id AND planner.company_id=driver.company_id AND pu.id=planner.user_id
AND ((du.email LIKE 'chofer1%' AND pu.email LIKE 'planificador1%')
  OR (du.email LIKE 'chofer2%' AND pu.email LIKE 'planificador2%'));

INSERT INTO operations_trucktype (company_id,name,height_cm,width_cm,length_cm,gross_weight_kg,axle_count,trailer_count,is_active)
SELECT id,'Tractocamión caja seca 53 pies',410,260,2100,48000,5,1,true FROM operations_company
ON CONFLICT (company_id,name) DO NOTHING;

INSERT INTO operations_restrictedzonegroup (company_id,name,description,color,is_visible,created_by_id)
SELECT c.id,'Chihuahua','Restricciones conocidas para tráileres en Chihuahua','#DC2626',true,u.id
FROM operations_company c JOIN users_user u ON (c.slug='salzillo' AND u.email='planificador1@salzillo.mx') OR (c.slug='transportes' AND u.email='planificador1@transportes.mx')
ON CONFLICT (company_id,name) DO NOTHING;

INSERT INTO operations_restrictedzone (group_id,name,polygon,created_by_id,created_at)
SELECT g.id,'Centro de Chihuahua', '{"type":"Polygon","coordinates":[[[-106.083,28.638],[-106.071,28.638],[-106.071,28.646],[-106.083,28.638]]]}'::jsonb, g.created_by_id, now()
FROM operations_restrictedzonegroup g
WHERE g.name='Chihuahua' AND NOT EXISTS (SELECT 1 FROM operations_restrictedzone z WHERE z.group_id=g.id AND z.name='Centro de Chihuahua');

COMMIT;
