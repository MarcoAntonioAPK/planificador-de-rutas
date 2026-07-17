# Guía para agentes del frontend

Estas reglas complementan el `AGENTS.md` raíz y se aplican a todo
`frontend/`.

## Límites

- El frontend es una aplicación independiente y debe poder servirse sin
  ejecutar Django.
- No añadas modelos, migraciones, lógica de persistencia ni secretos del
  backend.
- Centraliza futuras llamadas HTTP en un módulo de servicios; no repartas URLs
  o llamadas `fetch` entre componentes.
- Las credenciales de proveedores cartográficos deben llegar mediante
  configuración de entorno o de despliegue. No añadas nuevas claves al código.

## Código

- Conserva HTML semántico y accesible: etiquetas asociadas a campos, controles
  utilizables con teclado y textos alternativos cuando correspondan.
- Usa JavaScript moderno y evita crear nuevas variables globales. Las funciones
  expuestas al HTML existente deben mantenerse solo hasta sustituir los
  manejadores inline.
- Reutiliza las variables definidas en `:root` para colores, medidas y sombras.
- Mantén una responsabilidad por módulo. Al crecer la aplicación, separa
  `assets/css`, `assets/js`, `components`, `pages` y `services` mediante un
  cambio dedicado, sin crear carpetas vacías preventivamente.
- No edites directamente archivos de dependencias de terceros ni confirmes
  bundles generados.

## Verificación

- Sirve el directorio con un servidor HTTP local; no valides únicamente abriendo
  `index.html` mediante `file://`.
- Comprueba la consola del navegador, el diseño adaptable y el flujo de cálculo
  de ruta.
- Si se incorpora un gestor de paquetes, documenta y ejecuta sus tareas de
  lint, test y build antes de cada entrega.

