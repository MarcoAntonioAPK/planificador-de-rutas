# Guía para agentes

## Alcance

Estas instrucciones aplican a todo el monorepo. Los archivos `AGENTS.md` de
`frontend/` y `backend/` añaden reglas específicas para cada aplicación y
tienen prioridad dentro de su directorio.

## Arquitectura

- Mantén `frontend/` y `backend/` como aplicaciones independientes. No muevas
  código de una capa a la otra ni hagas que compartan dependencias de forma
  implícita.
- La comunicación entre ambas capas se realizará mediante una API HTTP
  versionada (`/api/v1/`). El frontend no debe depender de detalles internos de
  Django.
- No añadas la aplicación móvil ni directorios reservados para ella.
- Las decisiones que afecten a las dos aplicaciones deben documentarse en el
  `README.md` raíz.

## Forma de trabajo

1. Lee este archivo y el `AGENTS.md` más cercano al archivo que vas a cambiar.
2. Limita cada cambio a una responsabilidad y conserva commits pequeños.
3. Actualiza el README de la aplicación cuando cambien instalación, comandos,
   configuración o estructura.
4. Nunca confirmes secretos, credenciales ni archivos `.env`; proporciona
   variables de ejemplo cuando sean necesarias.
5. Ejecuta las comprobaciones de la aplicación afectada antes de cerrar el
   cambio. Si todavía no existen, documenta la verificación manual realizada.

## Convenciones comunes

- Código, nombres técnicos, commits y documentación se escriben en español o
  inglés de forma consistente con el módulo existente.
- Usa UTF-8, finales de línea LF y una línea final en cada archivo.
- Evita dependencias globales y fija versiones reproducibles en el manifiesto
  correspondiente a cada aplicación.
- No mezcles refactorizaciones no relacionadas con una funcionalidad.

