# Backend

API Django de RouteFlow. El primer dominio implementado es la autenticación de
usuarios mediante sesiones seguras y correo electrónico.

## Versiones

El manifiesto fija Django `5.2.7`, la versión de compatibilidad tomada como base
para mantener el backend alineado con gym-erp, y `django-cors-headers 4.7.0`.
Si gym-erp actualiza su versión, ambos proyectos deben actualizarse juntos y
pasar sus pruebas antes de desplegarse.

## Instalación

```bash
cd backend
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
set -a && source .env && set +a
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 8001
```

El frontend se sirve en `http://localhost:8000` y utiliza por defecto la API en
`http://localhost:8001/api/v1`. En otro entorno se debe definir
`window.ROUTEFLOW_API_URL` antes de cargar `assets/js/login.js`.

La guía detallada para generar `DJANGO_SECRET_KEY`, conectar PostgreSQL desde
Django y DBeaver, y trabajar con migraciones está en
[`docs/database.md`](docs/database.md).

## Estructura

```text
backend/
├── config/              # settings, URLs y WSGI
├── apps/users/          # usuario, administrador y endpoints de sesión
├── manage.py
└── requirements.txt
```

## Autenticación

El modelo `users.User` usa el correo único como identificador e incorpora nombre
y rol (`admin`, `planner` o `driver`). `AUTH_USER_MODEL` se configuró desde la
primera migración para permitir su evolución sin sustituir tablas posteriormente.

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/v1/auth/csrf/` | Entrega el token CSRF y prepara su cookie. |
| `POST` | `/api/v1/auth/login/` | Abre una sesión con `email` y `password`. |
| `POST` | `/api/v1/auth/logout/` | Cierra la sesión actual. |

Las peticiones de escritura requieren `X-CSRFToken`; las cookies son HTTP-only
y CORS solo acepta los orígenes indicados en `DJANGO_CORS_ALLOWED_ORIGINS`.

## Comprobaciones

```bash
python manage.py makemigrations --check --dry-run
python manage.py test
python manage.py check
python manage.py check --deploy
```
