# Backend

Espacio reservado para la futura API Django del planificador de rutas. Todavía
no contiene una aplicación ejecutable ni instala dependencias.

## Compatibilidad con gym-erp

El backend debe empezar con la **misma versión exacta** de Python, Django y
Django REST Framework usada por gym-erp. Esa información se copiará desde sus
archivos de dependencias cuando comience la implementación y quedará fijada en
un manifiesto reproducible. No se declara aquí una versión supuesta porque eso
podría hacer incompatibles ambos proyectos.

Lista previa al scaffold:

1. Consultar los archivos de runtime y dependencias de gym-erp.
2. Fijar las mismas versiones, incluyendo herramientas de formato y pruebas.
3. Replicar su estrategia de configuración por entornos, sin copiar secretos.
4. Registrar aquí los comandos reales de instalación, migración y ejecución.
5. Añadir CI para tests, lint, migraciones pendientes y `check --deploy`.

## Estructura objetivo

La estructura se creará cuando exista el primer caso de uso backend; no se
mantienen paquetes vacíos:

```text
backend/
├── manage.py
├── pyproject.toml o requirements/   # Igual que gym-erp
├── .env.example
├── config/                          # settings, urls, ASGI y WSGI
├── apps/
│   ├── routes/                      # rutas y puntos de paso
│   └── restricted_areas/            # áreas y restricciones
└── tests/
```

Los nombres definitivos de las aplicaciones dependerán del dominio validado.
No se debe crear una aplicación genérica `core` para acumular lógica sin dueño.

## API inicial prevista

El contrato público se publicará bajo `/api/v1/`. Los primeros recursos
probables son rutas y áreas restringidas, pero sus endpoints no se consideran
definitivos hasta documentar casos de uso, permisos y esquemas de respuesta.

El backend será responsable de:

- autenticación y autorización;
- persistencia de rutas y áreas restringidas;
- validación de reglas de negocio;
- protección de claves de proveedores externos;
- generación asíncrona de documentos o cálculos costosos cuando sea necesario.

El frontend seguirá siendo una aplicación independiente y nunca importará
módulos ni plantillas Django.

## Comandos

Los comandos se añadirán junto con el scaffold. Hasta entonces no debe
presentarse este directorio como un servicio ejecutable.

