# Planificador de rutas

Monorepo para una plataforma de planificación de rutas de transporte. La
separación sigue el mismo modelo de trabajo de **gym-erp** para las aplicaciones
web: un frontend autónomo y un backend Django autónomo. La aplicación móvil
queda expresamente fuera del alcance de este repositorio.

> El frontend incluye el planificador y la pantalla de acceso. El backend inicia
> con el modelo de usuario y los endpoints de sesión; los dominios de rutas se
> incorporarán de forma incremental.

## Estructura

```text
.
├── AGENTS.md          # Reglas comunes del monorepo
├── README.md          # Visión general y contratos entre aplicaciones
├── frontend/          # Aplicación web existente
│   ├── AGENTS.md      # Reglas específicas del frontend
│   ├── README.md      # Puesta en marcha y arquitectura del frontend
│   ├── index.html
│   └── assets/
│       ├── css/app.css
│       └── js/
│           ├── ui.js
│           └── map.js
└── backend/           # Espacio preparado para la futura API Django
    ├── AGENTS.md      # Reglas específicas de Django/API
    ├── README.md      # Instalación y contrato de autenticación
    ├── config/        # Configuración Django
    └── apps/users/    # Modelo de usuario y endpoints de sesión
```

## Responsabilidades

### Frontend

- Renderiza la interfaz de planificación y el mapa.
- Recoge y valida la interacción inmediata del usuario.
- Consume servicios cartográficos y, cuando exista, la API del backend.
- No contiene reglas persistentes de negocio ni acceso directo a la base de
  datos.

Consulta [`frontend/README.md`](frontend/README.md) para ejecutarlo.

### Backend

- Expondrá una API REST versionada bajo `/api/v1/`.
- Gestionará autenticación, permisos, persistencia y reglas de negocio.
- Encapsulará integraciones sensibles y secretos de proveedores.
- Usa Django 5.2.7 como versión de compatibilidad con **gym-erp**, fijada en el
  manifiesto del backend para instalaciones reproducibles.

Consulta [`backend/README.md`](backend/README.md) para el diseño previsto.

## Contrato entre aplicaciones

Frontend y backend se despliegan y prueban de forma independiente. Su único
acoplamiento permitido es el contrato HTTP documentado:

- prefijo de API: `/api/v1/`;
- contenido: JSON;
- fechas y horas: ISO 8601 y UTC;
- errores: código HTTP adecuado y cuerpo estable con `code`, `message` y
  `details`;
- autenticación y política CORS: responsabilidad del backend;
- URL base del API: configuración de entorno del frontend, nunca una constante
  dispersa por el código.

Cuando se añada el backend, sus cambios de contrato deberán acompañarse de
documentación y pruebas de integración del consumidor frontend.

## Flujo recomendado

1. Crea una rama por cambio.
2. Trabaja únicamente en la aplicación afectada y sigue su `AGENTS.md`.
3. Ejecuta las comprobaciones descritas en su README.
4. Si se modifica el contrato HTTP, actualiza ambos README y sus pruebas.
5. Entrega un commit autocontenido, sin secretos ni artefactos generados.
