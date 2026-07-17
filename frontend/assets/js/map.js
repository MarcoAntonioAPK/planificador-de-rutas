(() => {
    "use strict";

    const HERE_API_KEY = window.PLANIFICADOR_CONFIG?.hereApiKey;
    const areaCount = document.querySelector("#areaCount");
    const clearAreasButton = document.querySelector("#clearAreasBtn");
    const routeForm = document.querySelector("#routeForm");
    const recalculateButton = document.querySelector("#recalculateRouteBtn");
    const mapElement = document.querySelector("#map");

    let map;
    let router;
    let routeGroup;
    let routeBounds;
    let temporaryCoordinates = [];
    let areas = [];
    let inflatedAreas = [];
    let areaObjects = [];
    let temporaryMarkers = [];

    function notify(message, type = "success") {
        window.dispatchEvent(new CustomEvent("routeflow:toast", { detail: { message, type } }));
    }

    function setLoading(isLoading) {
        window.dispatchEvent(new CustomEvent("routeflow:loading", { detail: isLoading }));
    }

    function initializeMap() {
        if (!window.H || !HERE_API_KEY) {
            mapElement.classList.add("map-unavailable");
            mapElement.innerHTML = '<div class="map-error"><i class="fa-solid fa-map"></i><strong>Mapa no disponible</strong><span>Configura la credencial de HERE Maps para este entorno.</span></div>';
            notify("No se pudo cargar el proveedor cartográfico.", "error");
            return;
        }

        const platform = new H.service.Platform({ apikey: HERE_API_KEY });
        const defaultLayers = platform.createDefaultLayers();
        map = new H.Map(mapElement, defaultLayers.vector.normal.map, {
            center: { lat: 40.4168, lng: -3.7038 },
            zoom: 13,
            pixelRatio: window.devicePixelRatio || 1
        });

        window.addEventListener("resize", () => map.getViewPort().resize());
        new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
        const ui = H.ui.UI.createDefault(map, defaultLayers, "es-ES");
        ui.getControl("mapsettings")?.setVisibility(false);
        router = platform.getRoutingService(null, 8);
        map.addEventListener("tap", addAreaPoint);
    }

    function parseCoordinates() {
        const origin = parseCoordinate(document.querySelector("#origenCoords").value, "origen");
        const destination = parseCoordinate(document.querySelector("#destinoCoords").value, "destino");
        return { origin, destination };
    }

    function parseCoordinate(value, label) {
        const parts = value.split(",").map((coordinate) => Number.parseFloat(coordinate.trim()));
        if (parts.length !== 2 || parts.some(Number.isNaN) || Math.abs(parts[0]) > 90 || Math.abs(parts[1]) > 180) {
            throw new Error(`Revisa las coordenadas de ${label}. Usa el formato latitud, longitud.`);
        }
        return { lat: parts[0], lng: parts[1] };
    }

    function addAreaPoint(event) {
        const coordinate = map.screenToGeo(event.currentPointer.viewportX, event.currentPointer.viewportY);
        const point = { lat: coordinate.lat, lng: coordinate.lng };
        temporaryCoordinates.push(point);

        const marker = new H.map.Marker(coordinate);
        map.addObject(marker);
        temporaryMarkers.push(marker);

        if (temporaryCoordinates.length < 3) {
            notify(`Punto ${temporaryCoordinates.length} de 3 añadido al área.`);
            return;
        }

        const triangle = [...temporaryCoordinates];
        areas.push(triangle);
        const inflated = inflateTriangle(triangle);
        inflatedAreas.push(inflated);

        const originalPolygon = createPolygon(triangle, "rgba(220, 67, 67, 0.22)", "#d44343", 2);
        const safetyPolygon = createPolygon(inflated, "rgba(220, 122, 24, 0.08)", "#dc7a18", 1);
        map.addObjects([safetyPolygon, originalPolygon]);
        areaObjects.push(originalPolygon, safetyPolygon, ...temporaryMarkers);
        temporaryCoordinates = [];
        temporaryMarkers = [];
        updateAreaCounter();
        notify("Área restringida delimitada.");
    }

    function createPolygon(coordinates, fillColor, strokeColor, lineWidth) {
        const lineString = new H.geo.LineString();
        coordinates.forEach(({ lat, lng }) => lineString.pushLatLngAlt(lat, lng, 0));
        lineString.pushLatLngAlt(coordinates[0].lat, coordinates[0].lng, 0);
        return new H.map.Polygon(lineString, { style: { fillColor, strokeColor, lineWidth } });
    }

    function inflateTriangle(coordinates, margin = 0.08) {
        const center = {
            lat: coordinates.reduce((sum, point) => sum + point.lat, 0) / coordinates.length,
            lng: coordinates.reduce((sum, point) => sum + point.lng, 0) / coordinates.length
        };
        return coordinates.map((point) => ({
            lat: point.lat + (point.lat - center.lat) * margin,
            lng: point.lng + (point.lng - center.lng) * margin
        }));
    }

    function clearAreas() {
        if (!map) return;
        [...areaObjects, ...temporaryMarkers].forEach((object) => map.removeObject(object));
        areas = [];
        inflatedAreas = [];
        areaObjects = [];
        temporaryCoordinates = [];
        temporaryMarkers = [];
        updateAreaCounter();
        notify("Se eliminaron las áreas restringidas.");
    }

    function updateAreaCounter() {
        const total = areas.length;
        areaCount.textContent = `${total} ${total === 1 ? "área" : "áreas"}`;
        areaCount.classList.toggle("has-areas", total > 0);
        clearAreasButton.disabled = total === 0 && temporaryCoordinates.length === 0;
    }

    function calculateRoute(avoidRestrictedAreas) {
        if (!router) {
            notify("El mapa todavía no está disponible.", "error");
            return;
        }

        try {
            const { origin, destination } = parseCoordinates();
            const parameters = {
                transportMode: "truck",
                origin: `${origin.lat},${origin.lng}`,
                destination: `${destination.lat},${destination.lng}`,
                return: "polyline,summary",
                "vehicle[height]": 410,
                "vehicle[width]": 260,
                "vehicle[length]": 2100,
                "vehicle[grossWeight]": Number(document.querySelector("#cargoWeight").value) + 18000,
                "vehicle[axleCount]": 5,
                departureTime: new Date(document.querySelector("#departureAt").value).toISOString()
            };

            if (avoidRestrictedAreas && inflatedAreas.length > 0) {
                parameters["avoid[areas]"] = inflatedAreas.map((coordinates) => {
                    const closedArea = [...coordinates, coordinates[0]];
                    return `polygon:${closedArea.map(({ lat, lng }) => `${lat},${lng}`).join(";")}`;
                }).join("|");
            }

            setLoading(true);
            router.calculateRoute(parameters, showRoute, handleRouteError);
        } catch (error) {
            notify(error.message, "error");
        }
    }

    function showRoute(result) {
        if (routeGroup) map.removeObject(routeGroup);
        routeGroup = new H.map.Group();
        let totalLength = 0;
        let totalDuration = 0;

        result.routes[0].sections.forEach((section) => {
            const lineString = H.geo.LineString.fromFlexiblePolyline(section.polyline);
            const outline = new H.map.Polyline(lineString, { style: { strokeColor: "rgba(255,255,255,.9)", lineWidth: 9 } });
            const routeLine = new H.map.Polyline(lineString, { style: { strokeColor: "#175cd3", lineWidth: 5 } });
            routeGroup.addObjects([outline, routeLine]);
            totalLength += section.summary.length;
            totalDuration += section.summary.duration;
        });

        map.addObject(routeGroup);
        routeBounds = routeGroup.getBoundingBox();
        map.getViewModel().setLookAtData({ bounds: routeBounds, padding: { top: 80, right: 80, bottom: 130, left: 80 } });
        document.querySelector("#routeDistance").textContent = `${(totalLength / 1000).toFixed(1)} km de recorrido`;
        document.querySelector("#routeDuration").textContent = formatDuration(totalDuration);
        document.querySelector("#routeStatus").textContent = inflatedAreas.length ? "Optimizada" : "Directa";
        setLoading(false);
        notify("Ruta calculada correctamente.");
        window.dispatchEvent(new CustomEvent("routeflow:calculated"));
    }

    function formatDuration(seconds) {
        const minutes = Math.round(seconds / 60);
        const hours = Math.floor(minutes / 60);
        return hours ? `${hours} h ${minutes % 60} min` : `${minutes} min`;
    }

    function handleRouteError(error) {
        console.error("Error al calcular la ruta:", error);
        setLoading(false);
        notify("No se pudo calcular la ruta. Revisa los puntos indicados.", "error");
    }

    routeForm.addEventListener("submit", (event) => {
        event.preventDefault();
        calculateRoute(false);
    });
    recalculateButton.addEventListener("click", () => {
        if (!inflatedAreas.length) notify("Marca al menos un área para calcular una alternativa.", "error");
        else calculateRoute(true);
    });
    clearAreasButton.addEventListener("click", clearAreas);
    document.querySelector("#fitMapBtn").addEventListener("click", () => {
        if (routeBounds) map.getViewModel().setLookAtData({ bounds: routeBounds });
        else map?.setCenter({ lat: 40.4168, lng: -3.7038 });
    });

    initializeMap();
})();
