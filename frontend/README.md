# Frontend

Interfaz web actual del planificador de rutas. Es una aplicación estática que
utiliza Bootstrap, Font Awesome, jQuery y HERE Maps desde CDN.

## Requisitos

- Un navegador moderno.
- Python 3 (solo para el servidor HTTP local del ejemplo) o cualquier servidor
  de archivos estáticos.
- Acceso a internet para cargar las dependencias CDN y los servicios de HERE.

## Ejecución local

Desde la raíz del repositorio:

```bash
python3 -m http.server 8000 --directory frontend
```

Abre <http://localhost:8000>.

## Archivos actuales

| Archivo | Responsabilidad |
| --- | --- |
| `index.html` | Planificador minimalista y carga de dependencias. |
| `login.html` | Pantalla de acceso conectada a la API Django. |
| `assets/css/app.css` | Sistema visual minimalista, layout y componentes. |
| `assets/css/login.css` | Estilos exclusivos de autenticación. |
| `assets/js/ui.js` | Interacciones de interfaz, panel móvil y notificaciones. |
| `assets/js/login.js` | Sesión, CSRF y visibilidad de contraseña. |
| `assets/js/map.js` | HERE Maps, validación, áreas restringidas y cálculo de rutas. |

La separación por tipo de recurso mantiene el documento HTML libre de estilos y
lógica inline. Los módulos JavaScript se reparten por responsabilidad para que
las próximas integraciones no conviertan el mapa en un archivo de interfaz
generalista.

## Configuración

La implementación heredada contiene la configuración de HERE en
`assets/js/map.js`.
Antes de publicar o ampliar la aplicación se debe rotar esa credencial y
extraerla a configuración de despliegue. No deben añadirse más secretos al
repositorio.

La futura URL del backend también debe ser configurable por entorno. Durante el
desarrollo se recomienda servir cada aplicación en su propio puerto y declarar
los orígenes permitidos en Django.

## Evolución prevista

1. Añadir un manifiesto de dependencias y tareas reproducibles cuando se adopte
   una herramienta de build.
2. Extraer la configuración y el cliente de HERE del dominio de rutas.
3. Crear una capa `services` para consumir `/api/v1/`.
4. Dividir la interfaz en componentes y páginas solo cuando la complejidad lo
   justifique.
5. Incorporar lint, pruebas unitarias y pruebas de navegador al pipeline.

No se debe acoplar esta evolución a plantillas Django: el backend entregará una
API y el frontend conservará su ciclo de vida independiente.
