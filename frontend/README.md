# Frontend de Planificador de rutas

Aplicación estática, minimalista y adaptable. No requiere Vue 3, Node ni Tailwind: la paleta multiempresa se aplica con tokens CSS (`--primary`, `--secondary`, `--accent`) recibidos por `/api/v1/auth/me/`.

## Ejecutar

```bash
cp frontend/config.example.js frontend/config.js
# Edita config.js y agrega una credencial HERE válida solo en tu entorno.
python3 -m http.server 8000 --directory frontend
```

Abre <http://localhost:8000>. `config.js` está ignorado por Git y nunca debe publicarse con credenciales sin las restricciones de dominio correspondientes.

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
