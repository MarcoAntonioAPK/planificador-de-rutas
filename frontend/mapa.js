const API_KEY = 'o6fAtTiki_UKCCGjq4sBaymk6Ifs7EtwO7ABymZKt2E';
const platform = new H.service.Platform({ apikey: API_KEY });
const map = new H.Map(document.getElementById('contenedo_mapa'),
    platform.createDefaultLayers().vector.normal.map,
    { center:{lat:40.4168,lng:-3.7038}, zoom:13 }
);
window.addEventListener('resize', () => map.getViewPort().resize());
new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
H.ui.UI.createDefault(map, platform.createDefaultLayers());
const router = platform.getRoutingService(null, 8);

// Eliminamos las constantes ORIGEN y DESTINO y las obtendremos de los inputs
let routeGroup;

let triangles = [];
let inflatedPolygons = [];
let drawnPolygons = [];
let markers = [];
let triangleCounter = 1;
let tempCoords = [];

// Función para obtener coordenadas desde los inputs
function obtenerCoordenadasDesdeInputs() {
    const origenInput = document.getElementById('origenCoords').value;
    const destinoInput = document.getElementById('destinoCoords').value;
    
    // Parsear coordenadas (formato: "lat, lng")
    const [origenLat, origenLng] = origenInput.split(',').map(coord => parseFloat(coord.trim()));
    const [destinoLat, destinoLng] = destinoInput.split(',').map(coord => parseFloat(coord.trim()));
    
    // Validar coordenadas
    if (isNaN(origenLat) || isNaN(origenLng) || isNaN(destinoLat) || isNaN(destinoLng)) {
        throw new Error('Por favor ingrese coordenadas válidas en el formato: latitud, longitud');
    }
    
    return {
        origen: { lat: origenLat, lng: origenLng },
        destino: { lat: destinoLat, lng: destinoLng }
    };
}

map.addEventListener('tap', function (evt) {
    const coord = map.screenToGeo(evt.currentPointer.viewportX, evt.currentPointer.viewportY);
    const point = { lat: coord.lat, lng: coord.lng };
    tempCoords.push(point);

    const marker = new H.map.Marker(coord);
    map.addObject(marker);
    markers.push(marker);

    if (tempCoords.length === 3) {
        // Guardar triángulo
        const triangle = [...tempCoords];
        triangles.push(triangle);

        // Dibujar triángulo original (rojo transparente)
        const originalLS = new H.geo.LineString();
        triangle.forEach(p => originalLS.pushLatLngAlt(p.lat, p.lng, 0));
        originalLS.pushLatLngAlt(triangle[0].lat, triangle[0].lng, 0); // cerrar
        const polygon = new H.map.Polygon(originalLS, {
            style: { fillColor: 'rgba(255,0,0,0.3)', strokeColor: 'red', lineWidth: 2 }
        });
        map.addObject(polygon);
        drawnPolygons.push(polygon);

        // Inflar y guardar (azul transparente)
        const inflatedCoords = inflateTriangle(triangle, 0.0012);
        const inflatedLS = new H.geo.LineString();
        inflatedCoords.forEach(p => inflatedLS.pushLatLngAlt(p.lat, p.lng, 0));
        inflatedLS.pushLatLngAlt(inflatedCoords[0].lat, inflatedCoords[0].lng, 0); // cerrar
        const inflatedPoly = new H.map.Polygon(inflatedLS, {
            style: { fillColor: 'rgba(0,0,255,0.2)', strokeColor: 'blue', lineWidth: 1 }
        });
        map.addObject(inflatedPoly);
        inflatedPolygons.push(inflatedCoords);

        // Reset
        tempCoords = [];
        triangleCounter++;
    }
});

function borrarTriangulos() {
    drawnPolygons.forEach(p => map.removeObject(p));
    markers.forEach(m => map.removeObject(m));
    map.getObjects().forEach(o => {
    if (o instanceof H.map.Polygon && o.getStyle().strokeColor === 'blue') map.removeObject(o);
    });
    triangles = [];
    inflatedPolygons = [];
    drawnPolygons = [];
    markers = [];
    triangleCounter = 1;
    tempCoords = [];
}

function calcularRuta(evitarAreas) {
    try {
        // Obtener coordenadas desde los inputs
        const { origen, destino } = obtenerCoordenadasDesdeInputs();
        
        if (routeGroup) map.removeObject(routeGroup);

        const params = {
            transportMode: 'truck',
            origin: `${origen.lat},${origen.lng}`,
            destination: `${destino.lat},${destino.lng}`,
            return: 'polyline,summary',
            'truck[height]': 280,
            'truck[width]': 260, 
            'truck[length]': 1600,
            'truck[grossWeight]': 61730,
            'truck[weightPerAxle]': 61730,
            'truck[tunnelCategory]': 'B'
        };

        if (evitarAreas && inflatedPolygons.length > 0) {
            params['avoid[areas]'] = inflatedPolygons.map(coords => {
                const str = coords.concat([coords[0]]).map(p => `${p.lat},${p.lng}`).join(';');
                return `polygon:${str}`;
            }).join('|');
        }

        router.calculateRoute(params, onSuccess, onError);
    } catch (error) {
        alert(error.message);
        console.error('Error al obtener coordenadas:', error);
    }
}

function onSuccess(result) {
    const route = result.routes[0];
    routeGroup = new H.map.Group();
    route.sections.forEach(section => {
        const strip = H.geo.LineString.fromFlexiblePolyline(section.polyline);
        const line = new H.map.Polyline(strip, { style:{strokeColor:'green',lineWidth:5} });
        routeGroup.addObject(line);
    });
    map.addObject(routeGroup);
    map.getViewModel().setLookAtData({ bounds: routeGroup.getBoundingBox() });
    const sum = route.sections[0].summary;
    
    // Actualizar información de ruta si el elemento existe
    const infoElement = document.getElementById('informacion_ruta');
    if (infoElement) {
        infoElement.innerText = `${(sum.length/1000).toFixed(2)} km, aprox. ${Math.round(sum.duration/60)} min`;
    }
}

function onError(err) {
    console.error('Error en el enrutador:', err);
    
    // Actualizar información de ruta si el elemento existe
    const infoElement = document.getElementById('informacion_ruta');
    if (infoElement) {
        infoElement.innerText = 'Error al calcular ruta';
    }
}

function inflateTriangle(coords, factor = 0.0012) {
    const center = {
        lat: (coords[0].lat + coords[1].lat + coords[2].lat) / 3,
        lng: (coords[0].lng + coords[1].lng + coords[2].lng) / 3
    };
    return coords.map(p => ({
        lat: p.lat + (p.lat - center.lat) * factor,
        lng: p.lng + (p.lng - center.lng) * factor
    }));
}