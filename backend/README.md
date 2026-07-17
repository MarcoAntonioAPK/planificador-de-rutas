# Backend de Planificador de rutas

API Django/PostgreSQL multiempresa para usuarios, flota, zonas restringidas y rutas. Django `5.2.7`, `django-cors-headers 4.7.0` y `psycopg 3.2.10` están fijados en `requirements.txt`; no es necesario instalar Vue ni Tailwind.

## Instalación y migraciones

```bash
cd backend
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
set -a && source .env && set +a
python manage.py makemigrations --check --dry-run
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 8001
```

Go Live no ejecuta este proceso. Si el frontend se sirve en el puerto `5500`,
incluye su origen exacto en `.env` antes de iniciar Django:

```dotenv
DJANGO_CORS_ALLOWED_ORIGINS=http://localhost:5500,http://127.0.0.1:5500
FRONTEND_URL=http://localhost:5500
```

Después de cambiar estas variables, detén y vuelve a iniciar `runserver`.

Nunca guardes `.env`. Para datos de prueba, después de migrar:

```bash
psql "$DATABASE_URL" -f scripts/demo_data.sql
# o: psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f scripts/demo_data.sql
```

El script crea Salzillo y Transportes, sus administradores, dos planificadores y dos choferes **por empresa**, un tipo de tractocamión y el grupo/zona Chihuahua. Todas las cuentas incluidas usan `Temporal2026.` y deben cambiarla tras el primer acceso.

## Modelo y aislamiento

- `users.Role` es el catálogo ligado a `operations.Membership`: SuperAdmin, Admin, Planificador y Chofer.
- `Company` guarda su paleta (`primary_color`, `secondary_color`, `accent_color`) y logo.
- `Membership` liga usuario, empresa y rol; `supervisor` permite que un planificador agrupe choferes. Un usuario puede tener membresías independientes.
- `TruckType` guarda dimensiones, peso, ejes y remolques.
- `RestrictedZoneGroup` agrupa `RestrictedZone`; cada polígono se conserva como GeoJSON.
- `PlannedRoute` pertenece a una empresa, planificador, chofer opcional y tipo de tráiler. Conserva carga, salida, geometría y la solicitud preparada para HERE.

Los endpoints filtran por membresía. SuperAdmin puede administrar todas las empresas; Admin solo su empresa; Planificador sus rutas y catálogos; Chofer solo sus asignaciones.

## API `/api/v1/`

| Método | Ruta | Acceso |
|---|---|---|
| POST | `auth/register/` | Registro como `planner` o `driver` ligado a empresa |
| POST | `auth/login/`, `auth/logout/` | Sesión |
| GET | `auth/me/` | Perfil, membresías y tema |
| POST | `auth/password-reset/` | Correo de recuperación sin revelar si existe |
| GET/POST | `companies/` | Listado / alta por SuperAdmin |
| GET/POST | `companies/{id}/members/` | Admin y SuperAdmin |
| GET/POST | `companies/{id}/truck-types/` | Catálogo de unidades |
| GET/POST | `companies/{id}/restricted-zones/` | Grupos y polígonos |
| GET/POST | `companies/{id}/routes/` | Rutas filtradas por perfil |
| GET | `routes/{id}/` | Detalle imprimible/exportable |

Las escrituras usan sesión y `X-CSRFToken`, obtenido en `auth/csrf/`.

## HERE Routing API v8

La solicitud usa `transportMode=truck`, hora de salida y restricciones físicas (`vehicle[height]`, `width`, `length`, `grossWeight`, `axleCount`, `trailerCount`). Las zonas se traducen a `avoid[areas]`. El tipo y peso de mercancía se conservan como contexto interno: un texto libre de mercancía **no es un parámetro de Routing v8** y no debe enviarse como si lo fuera. Para mercancías peligrosas se debe ampliar el formulario con la clasificación admitida por HERE y mapearla a `truck[shippedHazardousGoods]`; el peso real debe contribuir al peso bruto del vehículo.

Referencia: [HERE Routing API documentation](https://www.here.com/docs/bundle/routing-api-v8-api-reference/page/index.html).

## Comprobaciones

```bash
python manage.py makemigrations --check --dry-run
python manage.py test
python manage.py check
python manage.py check --deploy
```
