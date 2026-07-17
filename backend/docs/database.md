# Base de datos y migraciones

Esta guía explica dos formas de preparar la base de datos de RouteFlow:

- **SQLite**, recomendada para comprobar el proyecto rápidamente y sin instalar
  un servidor;
- **PostgreSQL**, recomendada para desarrollo compartido y producción.

DBeaver es un cliente gráfico: permite consultar y administrar bases de datos,
pero **no crea ni ejecuta por sí mismo un servidor PostgreSQL**. Para usar
PostgreSQL primero debes instalar el servidor en tu sistema o disponer de uno
remoto.

## Opción A: empezar con SQLite

SQLite ya está incluido en Python. Desde la raíz del repositorio:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
set -a
source .env
set +a
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 8001
```

`python manage.py migrate` crea automáticamente `backend/db.sqlite3`. Para
abrirlo en DBeaver:

1. Selecciona **Database > New Database Connection**.
2. Busca **SQLite**.
3. En **Path**, selecciona el archivo `backend/db.sqlite3`.
4. Pulsa **Test Connection**; DBeaver puede solicitar descargar su driver.
5. Pulsa **Finish** y abre **Tables** para inspeccionar el esquema.

No edites manualmente las tablas de Django desde DBeaver. Los cambios de
estructura siempre deben realizarse mediante modelos y migraciones.

## Opción B: usar PostgreSQL

### 1. Instalar y arrancar PostgreSQL

Instala PostgreSQL con el mecanismo de tu sistema operativo y comprueba que el
servicio escucha en el puerto `5432`. DBeaver no sustituye este paso.

### 2. Crear usuario y base de datos

Abre `psql` con una cuenta administradora y ejecuta:

```sql
CREATE USER routeflow WITH PASSWORD 'elige-una-clave-segura';
CREATE DATABASE routeflow OWNER routeflow;
```

En una instalación local también puedes ejecutar el SQL desde DBeaver si ya
tienes una conexión administrativa a PostgreSQL.

### 3. Conectar DBeaver

1. Selecciona **Database > New Database Connection > PostgreSQL**.
2. Introduce `localhost` como **Host** y `5432` como **Port**.
3. Usa `routeflow` como **Database** y **Username**.
4. Introduce la contraseña elegida y pulsa **Test Connection**.
5. Acepta la descarga del driver si DBeaver la solicita y finaliza la conexión.

Crear la conexión en DBeaver no configura Django; aún debes completar el
siguiente paso.

### 4. Configurar el backend

Prepara el entorno y las dependencias:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Edita `.env` sin confirmarlo en Git:

```dotenv
DJANGO_SECRET_KEY=genera-una-clave-local-larga
DJANGO_DEBUG=true
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
DJANGO_CORS_ALLOWED_ORIGINS=http://localhost:8000
DB_ENGINE=postgresql
DB_NAME=routeflow
DB_USER=routeflow
DB_PASSWORD=elige-una-clave-segura
DB_HOST=127.0.0.1
DB_PORT=5432
```

Este proyecto no carga `.env` automáticamente. Exporta sus variables en la
terminal donde ejecutarás Django:

```bash
set -a
source .env
set +a
```

Puedes comprobar que la configuración apunta a PostgreSQL con:

```bash
python manage.py check
python manage.py shell -c "from django.db import connection; print(connection.settings_dict['ENGINE'])"
```

El segundo comando debe imprimir `django.db.backends.postgresql`.

### 5. Crear las tablas

Las migraciones existentes se aplican con:

```bash
python manage.py showmigrations
python manage.py migrate
```

Después actualiza la conexión en DBeaver y revisa el esquema `public`. Verás,
entre otras, `users_user`, `django_migrations` y las tablas de autenticación.

### 6. Crear el administrador

```bash
python manage.py createsuperuser
```

Inicia el backend con `python manage.py runserver 8001` y abre
`http://localhost:8001/admin/` para comprobar el acceso.

## Flujo para cambios futuros en modelos

Cuando modifiques un archivo `models.py`:

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py makemigrations --check --dry-run
python manage.py test
```

El primer comando genera el archivo que describe el cambio; el segundo lo
aplica a la base de datos. Revisa siempre la migración generada antes de
confirmarla. El tercer comando debe terminar sin detectar cambios pendientes.

Reglas importantes:

- confirma los archivos de `migrations/`, pero nunca `db.sqlite3` ni `.env`;
- no borres ni reescribas una migración que ya se aplicó en otro entorno;
- no uses DBeaver para cambiar manualmente columnas o restricciones;
- realiza una copia de seguridad antes de migraciones destructivas;
- en producción ejecuta `migrate` una sola vez por despliegue, desde un proceso
  controlado.

## Diagnóstico rápido

- **connection refused**: PostgreSQL no está iniciado, el host o el puerto son
  incorrectos, o un firewall bloquea la conexión.
- **password authentication failed**: `DB_USER` o `DB_PASSWORD` no coinciden con
  los creados en PostgreSQL.
- **database does not exist**: `DB_NAME` no existe todavía.
- **No module named psycopg**: activa `.venv` y repite
  `pip install -r requirements.txt`.
- **CSRF o CORS desde el login**: comprueba que el origen exacto del frontend
  aparece en `DJANGO_CORS_ALLOWED_ORIGINS` y vuelve a exportar `.env`.
