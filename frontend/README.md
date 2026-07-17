# Frontend de Planificador de rutas

Aplicación estática, minimalista y adaptable. No requiere Vue 3, Node ni Tailwind: la paleta multiempresa se aplica con tokens CSS (`--primary`, `--secondary`, `--accent`) recibidos por `/api/v1/auth/me/`.

## Ejecutar con Go Live (VS Code)

Go Live **solo sirve los archivos del frontend**. No inicia Django ni conecta
automáticamente las dos aplicaciones. Debes mantener el backend activo en otra
terminal.

1. Crea la configuración local del frontend desde la raíz del repositorio:

```bash
cp frontend/config.example.js frontend/config.js
```

2. Abre `frontend/config.js` y conserva `apiUrl` apuntando al backend:

```js
window.PLANIFICADOR_CONFIG = {
    hereApiKey: "TU_API_KEY_DE_HERE",
    apiUrl: "http://localhost:8001/api/v1"
};
```

3. En VS Code abre `frontend/login.html`, pulsa **Go Live** y visita normalmente
   <http://localhost:5500/frontend/login.html>. Si abriste `frontend/` como la
   carpeta raíz de VS Code, la URL será <http://localhost:5500/login.html>.

Como alternativa a Go Live:

```bash
python3 -m http.server 5500 --directory frontend
```

`config.js` está ignorado por Git y nunca debe publicarse con credenciales sin
las restricciones de dominio correspondientes.

## Iniciar el backend

En una segunda terminal, después de instalar y configurar PostgreSQL:

```bash
cd backend
. .venv/bin/activate
set -a && source .env && set +a
python manage.py migrate
python manage.py runserver 8001
```

El backend debe mostrar `Starting development server at
http://127.0.0.1:8001/`. Comprueba la comunicación abriendo
<http://localhost:8001/api/v1/auth/csrf/>; debe aparecer un JSON con
`csrfToken`.

Para usar los usuarios de ejemplo, carga primero el script PostgreSQL descrito
en el README del backend. Por ejemplo,
`salzillo_admin@gmail.com` / `Temporal2026.` solo existirá después de cargar
`backend/scripts/demo_data.sql`.

## Si el inicio de sesión no funciona

1. **`Failed to fetch`, error CORS o "No se pudo conectar":** Django no está
   activo o la URL exacta de Go Live no aparece en
   `DJANGO_CORS_ALLOWED_ORIGINS`. Para el puerto habitual usa:

   ```dotenv
   DJANGO_CORS_ALLOWED_ORIGINS=http://localhost:5500,http://127.0.0.1:5500
   ```

   Reinicia Django después de editar `.env`.
2. **HTTP 401:** el backend sí responde, pero el correo/contraseña no coincide o
   todavía no cargaste los datos de demostración.
3. **HTTP 403 CSRF:** usa el mismo hostname en ambas URLs (`localhost` con
   `localhost`, recomendado) y confirma que el origen completo, incluido el
   puerto, está en CORS/CSRF.
4. **`ERR_CONNECTION_REFUSED`:** ejecuta `python manage.py runserver 8001`.
5. **El mapa no aparece:** esto no bloquea el login; revisa por separado
   `hereApiKey` en `config.js`.

## Pantallas

- `login.html`, `registro.html` y `recuperar.html`: sesión, registro (Planificador/Chofer) y recuperación.
- `gestion.html`: interfaz adaptable a SuperAdmin, Admin, Planificador y Chofer. El selector "Vista de perfil" permite revisar el ejemplo de permisos; SuperAdmin dispone de modales para empresa/paleta y vinculación de usuarios.
- `index.html`: planificador HERE, zonas agrupables, unidad, mercancía, carga, salida, asignación de chofer y exportación mediante el diálogo de impresión/PDF del navegador.

## Configuración y API

`window.PLANIFICADOR_CONFIG` centraliza la credencial de HERE. La URL base de la API se configura en despliegue mediante `window.PLANIFICADOR_API_URL`; las llamadas no contienen secretos. Los estilos de empresa sustituyen los tokens CSS en el documento, por lo que toda la interfaz adopta una paleta sin compilar un bundle distinto.

## Verificación manual

```bash
python3 -m http.server 8000 --directory frontend
```

Comprueba `login.html`, `registro.html`, `recuperar.html`, las cuatro vistas de perfil en `gestion.html`, los modales, el panel móvil y la impresión de `index.html`.
