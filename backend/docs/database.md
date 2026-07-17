# PostgreSQL, configuración y migraciones

RouteFlow utiliza PostgreSQL. DBeaver sirve para conectarse y consultar la base,
pero no sustituye al servidor PostgreSQL ni configura Django automáticamente.

## 1. Entender `DJANGO_SECRET_KEY`

`DJANGO_SECRET_KEY` es una clave privada de Django utilizada para firmas
criptográficas, sesiones y otros mecanismos de seguridad. **No es** la
contraseña de PostgreSQL, no se escribe en la base de datos y no debe
compartirse ni confirmarse en Git.

Genera una clave desde cualquier terminal con Python:

```bash
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

El comando imprimirá un valor parecido a este ejemplo ficticio:

```text
Vj8r...un-valor-largo-y-aleatorio...9xQ
```

Copia el resultado completo en `backend/.env`:

```dotenv
DJANGO_SECRET_KEY=pega-aqui-el-resultado-completo
```

Cada entorno debe tener su propia clave: desarrollo, pruebas y producción no
deben compartirla. Si cambias la clave de un entorno existente, las sesiones y
firmas anteriores dejarán de ser válidas.

## 2. Confirmar los datos de PostgreSQL

Necesitas conocer los mismos valores que utilizas en la conexión de DBeaver:

| Variable Django | Campo habitual en DBeaver | Ejemplo |
| --- | --- | --- |
| `DB_NAME` | Database | `routeflow` |
| `DB_USER` | Username | `routeflow` |
| `DB_PASSWORD` | Password | la contraseña del usuario |
| `DB_HOST` | Host | `127.0.0.1` |
| `DB_PORT` | Port | `5432` |

`DB_NAME` es el nombre de la base que ya creaste; `DB_USER` es el usuario de
PostgreSQL con permiso sobre ella. No introduzcas aquí tu usuario o contraseña
de DBeaver salvo que sean, como normalmente ocurre, las credenciales reales del
usuario PostgreSQL guardadas por DBeaver.

## 3. Crear el archivo `.env`

Desde la raíz del repositorio:

```bash
cd backend
cp .env.example .env
```

En Windows PowerShell:

```powershell
cd backend
Copy-Item .env.example .env
```

Edita `.env` con tus valores reales:

```dotenv
DJANGO_SECRET_KEY=la-clave-generada-en-el-paso-1
DJANGO_DEBUG=true
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
DJANGO_CORS_ALLOWED_ORIGINS=http://localhost:8000
DB_NAME=routeflow
DB_USER=routeflow
DB_PASSWORD=tu-clave-real-de-postgresql
DB_HOST=127.0.0.1
DB_PORT=5432
```

No uses espacios alrededor de `=` y no confirmes `.env` en Git.

## 4. Preparar Python

Linux o macOS:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Windows PowerShell:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## 5. Cargar `.env`

El proyecto lee variables del proceso y no abre `.env` automáticamente. En
Linux o macOS, ejecútalo en cada terminal nueva:

```bash
set -a
source .env
set +a
```

En PowerShell puedes cargar las variables para la sesión actual con:

```powershell
Get-Content .env | ForEach-Object {
    if ($_ -match '^[^#].*=') {
        $name, $value = $_ -split '=', 2
        Set-Item -Path "Env:$name" -Value $value
    }
}
```

## 6. Comprobar la conexión

```bash
python manage.py check
python manage.py shell -c "from django.db import connection; connection.ensure_connection(); print(connection.settings_dict['ENGINE'], connection.settings_dict['NAME'])"
```

El segundo comando debe mostrar algo equivalente a:

```text
django.db.backends.postgresql routeflow
```

## 7. Aplicar migraciones

Primero consulta el estado y después crea las tablas:

```bash
python manage.py showmigrations
python manage.py migrate
```

Actualiza la conexión en DBeaver y abre `Schemas > public > Tables`. Deberás ver
`users_user`, `django_migrations`, `django_session` y las tablas de permisos.

## 8. Crear el administrador y arrancar

```bash
python manage.py createsuperuser
python manage.py runserver 8001
```

Abre `http://localhost:8001/admin/` e inicia sesión con el correo y la contraseña
que acabas de crear.

## Migraciones futuras

Después de modificar un modelo:

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py makemigrations --check --dry-run
python manage.py test
```

Confirma los archivos generados dentro de `migrations/`, pero nunca `.env`.
Tampoco cambies columnas manualmente con DBeaver: modifica el modelo y crea una
migración.

## Errores frecuentes

- **`KeyError: DJANGO_SECRET_KEY`**: no cargaste `.env` o la variable no existe.
- **`connection refused`**: PostgreSQL no está iniciado o `DB_HOST`/`DB_PORT`
  son incorrectos.
- **`password authentication failed`**: revisa `DB_USER` y `DB_PASSWORD`.
- **`database does not exist`**: `DB_NAME` no coincide con la base creada.
- **`permission denied for schema public`**: concede permisos al usuario o hazlo
  propietario de la base antes de ejecutar `migrate`.
