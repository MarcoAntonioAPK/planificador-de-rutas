# Guía para agentes del backend

Estas reglas complementan el `AGENTS.md` raíz y se aplican a todo `backend/`.

## Antes de crear el proyecto

- Comprueba en **gym-erp** la versión exacta de Python, Django y Django REST
  Framework y fíjalas aquí. No uses simplemente la última versión disponible.
- Documenta los comandos de instalación y las variables requeridas en este
  directorio.
- Mantén configuración separada por entorno y proporciona `.env.example` sin
  valores sensibles.

## Arquitectura Django

- Separa configuración del proyecto, aplicaciones de dominio y puntos de
  entrada. Las aplicaciones se organizan por capacidad de negocio, no por tipo
  técnico global.
- Mantén las vistas delgadas: validación en serializers/formularios y reglas de
  negocio en servicios de dominio explícitos.
- Versiona las rutas públicas bajo `/api/v1/` y evita romper contratos ya
  publicados.
- Usa migraciones para todo cambio de esquema; no edites migraciones aplicadas.
- Evita señales para flujos de negocio principales cuando una llamada explícita
  sea más fácil de seguir y probar.
- Lee secretos exclusivamente desde el entorno y nunca los incluyas en logs,
  fixtures o respuestas de API.

## Calidad y seguridad

- Cada endpoint debe cubrir caso correcto, validación, autenticación y permisos
  con pruebas.
- Evita consultas N+1 y añade índices basados en consultas reales.
- Configura CORS con una lista explícita de orígenes; no lo abras globalmente en
  producción.
- Ejecuta migraciones, tests, lint y las comprobaciones de despliegue de Django
  que queden definidas en el README antes de entregar.

