// Variables globales
// let map
// let routeControl
// let startMarker
// let endMarker
// let currentRoute
// let isFullscreen = false
// const $ = window.jQuery // Declare the $ variable
// const L = window.L // Declare the L variable

// Inicialización cuando el DOM está listo
$(document).ready(() => {
    // initializeMap()
    // initializeEventListeners()
    // initializeFormValidation()
    // setDefaultDates()
})

// Inicializar el mapa
// function initializeMap() {
//     // Crear el mapa centrado en México
//     map = L.map("map").setView([19.4326, -99.1332], 6)

//     // Agregar capa de tiles
//     L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//         attribution: "© OpenStreetMap contributors",
//         maxZoom: 18,
//     }).addTo(map)

//     // Personalizar controles del mapa
//     map.zoomControl.setPosition("bottomright")
// }

// Inicializar event listeners
function initializeEventListeners() {
    // Toggle sidebar
    $("#sidebarToggle").on("click", toggleSidebar)

    // Fullscreen toggle
    // $("#fullscreenBtn").on("click", toggleFullscreen)

    // // Center map
    // $("#centerMapBtn").on("click", centerMap)

    // Form submission
    // $("#routeForm").on("submit", handleRouteCalculation)

    // Clear form
    $("#clearFormBtn").on("click", clearForm)

    // Flammable toggle
    // $("#flammableToggle").on("change", handleFlammableToggle)

    // Autocomplete para direcciones
    // $("#startPoint, #endPoint").on("input", handleAddressAutocomplete)

    // Save route
    $("#saveRouteBtn").on("click", saveRoute)

    // Generate PDF
    $("#generatePdfBtn").on("click", generatePDF)

    // Responsive sidebar
    // $(window).on("resize", handleWindowResize)

    // Click outside sidebar to close (mobile)
    $(document).on("click", (e) => {
        if ($(window).width() <= 768) {
        if (!$(e.target).closest(".sidebar, .sidebar-toggle").length) {
            closeSidebar()
        }
        }
    })
}

// Toggle sidebar
function toggleSidebar() {
    const sidebar = $("#sidebar")
    const isCollapsed = sidebar.hasClass("collapsed")

    if (isCollapsed) {
        openSidebar()
    } else {
        closeSidebar()
    }
}

function openSidebar() {
    $("#sidebar").removeClass("collapsed").addClass("slide-in-left")
    $("#sidebarToggle i").removeClass("fa-bars").addClass("fa-times")
}

function closeSidebar() {
    $("#sidebar").addClass("collapsed").removeClass("slide-in-left")
    $("#sidebarToggle i").removeClass("fa-times").addClass("fa-bars")
}

// Toggle fullscreen
// function toggleFullscreen() {
//     const mapContainer = $("#mapContainer")
//     const fullscreenBtn = $("#fullscreenBtn i")

//     if (!isFullscreen) {
//         mapContainer.addClass("fullscreen")
//         fullscreenBtn.removeClass("fa-expand").addClass("fa-compress")
//         isFullscreen = true
//         closeSidebar()
//     } else {
//         mapContainer.removeClass("fullscreen")
//         fullscreenBtn.removeClass("fa-compress").addClass("fa-expand")
//         isFullscreen = false
//     }

//     // Invalidar el tamaño del mapa después del cambio
//     setTimeout(() => {
//         map.invalidateSize()
//     }, 300)
// }

// Center map
// function centerMap() {
//     if (currentRoute && currentRoute.bounds) {
//         map.fitBounds(currentRoute.bounds)
//     } else {
//         map.setView([19.4326, -99.1332], 6)
//     }
// }

// Handle window resize
// function handleWindowResize() {
//     if ($(window).width() > 768) {
//         $("#sidebar").removeClass("collapsed")
//     }
//     map.invalidateSize()
// }

// Handle flammable toggle
// function handleFlammableToggle() {
//     const isFlammable = $("#flammableToggle").is(":checked")
//     const warning = $("#flammableWarning")

//     if (isFlammable) {
//         warning.removeClass("d-none").addClass("fade-in")
//     } else {
//         warning.addClass("d-none").removeClass("fade-in")
//     }
// }

// // Address autocomplete simulation
// function handleAddressAutocomplete(e) {
//     const input = $(e.target)
//     const value = input.val()
//     const suggestionsContainer = input.siblings(".autocomplete-suggestions")

//     if (value.length < 3) {
//         suggestionsContainer.hide()
//         return
//     }

//     // Simular sugerencias (en producción, usar API real)
//     const mockSuggestions = [
//         "Ciudad de México, CDMX",
//         "Guadalajara, Jalisco",
//         "Monterrey, Nuevo León",
//         "Puebla, Puebla",
//         "Tijuana, Baja California",
//         "León, Guanajuato",
//         "Juárez, Chihuahua",
//         "Zapopan, Jalisco",
//     ].filter((city) => city.toLowerCase().includes(value.toLowerCase()))

//     if (mockSuggestions.length > 0) {
//         const suggestionsHtml = mockSuggestions
//         .map(
//             (suggestion) =>
//             `<div class="autocomplete-suggestion" data-value="${suggestion}">
//                     <i class="fas fa-map-marker-alt me-2"></i>${suggestion}
//                 </div>`,
//         )
//         .join("")

//         suggestionsContainer.html(suggestionsHtml).show()

//         // Handle suggestion click
//         suggestionsContainer.find(".autocomplete-suggestion").on("click", function () {
//         input.val($(this).data("value"))
//         suggestionsContainer.hide()
//         })
//     } else {
//         suggestionsContainer.hide()
//     }
// }

// // Handle route calculation
// function handleRouteCalculation(e) {
//     e.preventDefault()

//     const formData = getFormData()

//     if (!validateForm(formData)) {
//         return
//     }

//     showLoading()

//     // Simular cálculo de ruta
//     setTimeout(() => {
//         calculateRoute(formData)
//         hideLoading()
//     }, 2000)
//     }

//     // Get form data
//     function getFormData() {
//     return {
//         startPoint: $("#startPoint").val(),
//         endPoint: $("#endPoint").val(),
//         trailerType: $("#trailerType").val(),
//         dimensions: {
//         length: Number.parseFloat($("#length").val()) || 0,
//         width: Number.parseFloat($("#width").val()) || 0,
//         height: Number.parseFloat($("#height").val()) || 0,
//         maxWeight: Number.parseInt($("#maxWeight").val()) || 0,
//         },
//         cargoTypes: $(".cargo-types input:checked")
//         .map(function () {
//             return $(this).val()
//         })
//         .get(),
//         isFlammable: $("#flammableToggle").is(":checked"),
//         dates: {
//         startDate: $("#startDate").val(),
//         endDate: $("#endDate").val(),
//         departureTime: $("#departureTime").val(),
//         },
//     }
// }

// Validate form
function validateForm(data) {
    let isValid = true
    const errors = []

    if (!data.startPoint) {
        errors.push("Punto de partida es requerido")
        isValid = false
    }

    if (!data.endPoint) {
        errors.push("Punto de destino es requerido")
        isValid = false
    }

    if (!data.trailerType) {
        errors.push("Tipo de tráiler es requerido")
        isValid = false
    }

    if (
        data.dimensions.length <= 0 ||
        data.dimensions.width <= 0 ||
        data.dimensions.height <= 0 ||
        data.dimensions.maxWeight <= 0
    ) {
        errors.push("Todas las dimensiones deben ser mayores a 0")
        isValid = false
    }

    if (data.cargoTypes.length === 0) {
        errors.push("Debe seleccionar al menos un tipo de carga")
        isValid = false
    }

    if (!data.dates.startDate || !data.dates.endDate || !data.dates.departureTime) {
        errors.push("Fechas y hora de partida son requeridas")
        isValid = false
    }

    if (!isValid) {
        showErrors(errors)
    }

    return isValid
}

// // Show validation errors
// function showErrors(errors) {
//     const errorHtml = errors
//         .map(
//         (error) =>
//             `<div class="alert alert-danger alert-dismissible fade show" role="alert">
//                 <i class="fas fa-exclamation-triangle me-2"></i>
//                 ${error}
//                 <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
//             </div>`,
//         )
//         .join("")

//     // Insertar errores al inicio del formulario
//     $("#routeForm").prepend(errorHtml)

//     // Auto-remove after 5 seconds
//     setTimeout(() => {
//         $(".alert").alert("close")
//     }, 5000)
// }

// Calculate route
// function calculateRoute(data) {
//     // Limpiar ruta anterior
//     clearRoute()

//     // Coordenadas simuladas (en producción usar geocoding API)
//     const startCoords = getCoordinatesFromAddress(data.startPoint)
//     const endCoords = getCoordinatesFromAddress(data.endPoint)

//     // Crear marcadores
//     startMarker = L.marker(startCoords, {
//         icon: L.divIcon({
//         html: '<i class="fas fa-play" style="color: #16a34a;"></i>',
//         iconSize: [20, 20],
//         className: "custom-div-icon",
//         }),
//     })
//         .addTo(map)
//         .bindPopup(`<strong>Origen:</strong><br>${data.startPoint}`)

//     endMarker = L.marker(endCoords, {
//         icon: L.divIcon({
//         html: '<i class="fas fa-flag" style="color: #dc2626;"></i>',
//         iconSize: [20, 20],
//         className: "custom-div-icon",
//         }),
//     })
//         .addTo(map)
//         .bindPopup(`<strong>Destino:</strong><br>${data.endPoint}`)

//     // Crear ruta simulada
//     const routeCoords = generateRouteCoordinates(startCoords, endCoords)
//     const routeColor = data.isFlammable ? "#dc2626" : "#2563eb"

//     const routeLine = L.polyline(routeCoords, {
//         color: routeColor,
//         weight: 4,
//         opacity: 0.8,
//     }).addTo(map)

//     // Calcular estadísticas de ruta
//     const distance = calculateDistance(startCoords, endCoords)
//     const time = calculateTravelTime(distance, data.trailerType)
//     const fuel = calculateFuelConsumption(distance, data.trailerType)

//     // Guardar información de ruta
//     currentRoute = {
//         data: data,
//         coords: routeCoords,
//         bounds: routeLine.getBounds(),
//         stats: { distance, time, fuel },
//     }

//     // Mostrar información de ruta
//     displayRouteInfo(currentRoute.stats, data)

//     // Ajustar vista del mapa
//     map.fitBounds(routeLine.getBounds(), { padding: [20, 20] })

//     // Mostrar advertencias si es necesario
//     showRouteWarnings(data)
// }

// Get coordinates from address (simulation)
// function getCoordinatesFromAddress(address) {
//     const cityCoords = {
//         "Ciudad de México": [19.4326, -99.1332],
//         Guadalajara: [20.6597, -103.3496],
//         Monterrey: [25.6866, -100.3161],
//         Puebla: [19.0414, -98.2063],
//         Tijuana: [32.5149, -117.0382],
//         León: [21.1619, -101.6921],
//         Juárez: [31.6904, -106.4245],
//         Zapopan: [20.7227, -103.3991],
//     }

//     // Buscar coincidencia parcial
//     for (const [city, coords] of Object.entries(cityCoords)) {
//         if (address.toLowerCase().includes(city.toLowerCase())) {
//         return coords
//         }
//     }

//     // Coordenadas por defecto (Ciudad de México)
//     return [19.4326, -99.1332]
// }

// // Generate route coordinates (simulation)
// function generateRouteCoordinates(start, end) {
//     const coords = [start]
//     const steps = 10

//     for (let i = 1; i < steps; i++) {
//         const lat = start[0] + (end[0] - start[0]) * (i / steps)
//         const lng = start[1] + (end[1] - start[1]) * (i / steps)
//         coords.push([lat, lng])
//     }

//     coords.push(end)
//     return coords
// }

// // Calculate distance between two points
// function calculateDistance(start, end) {
//     const R = 6371 // Radio de la Tierra en km
//     const dLat = ((end[0] - start[0]) * Math.PI) / 180
//     const dLon = ((end[1] - start[1]) * Math.PI) / 180
//     const a =
//         Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//         Math.cos((start[0] * Math.PI) / 180) * Math.cos((end[0] * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
//     return Math.round(R * c)
// }

// Calculate travel time
// function calculateTravelTime(distance, trailerType) {
//     const speedMap = {
//         "rabon-caja-cerrada": 70,
//         "torton-caja-cerrada": 65,
//         "trailer-caja-seca": 60,
//     }

//     const speed = speedMap[trailerType] || 65
//     return Math.round((distance / speed) * 60) // en minutos
// }

// // Calculate fuel consumption
// function calculateFuelConsumption(distance, trailerType) {
//     const consumptionMap = {
//         "rabon-caja-cerrada": 8, // km/L
//         "torton-caja-cerrada": 6,
//         "trailer-caja-seca": 4,
//     }

//     const efficiency = consumptionMap[trailerType] || 6
//     return Math.round(distance / efficiency)
// }

// Display route information
// function displayRouteInfo(stats, data) {
//     $("#routeDistance").text(`${stats.distance} km`)
//     $("#routeTime").text(`${Math.floor(stats.time / 60)}h ${stats.time % 60}min`)
//     $("#fuelEstimate").text(`${stats.fuel} L`)

//     $("#routeInfoPanel").addClass("show")
// }

// Show route warnings
// function showRouteWarnings(data) {
//     const warningsContainer = $("#routeWarnings")
//     warningsContainer.empty()

//     const warnings = []

//     if (data.isFlammable) {
//         warnings.push({
//         icon: "fa-fire",
//         text: "Carga flamable: Se aplicarán restricciones de ruta",
//         })
//     }

//     if (data.cargoTypes.includes("quimicos")) {
//         warnings.push({
//         icon: "fa-flask",
//         text: "Carga química: Requiere documentación especial",
//         })
//     }

//     if (data.dimensions.height > 4.0) {
//         warnings.push({
//         icon: "fa-exclamation-triangle",
//         text: "Altura excesiva: Verificar puentes en la ruta",
//         })
//     }

//     if (warnings.length > 0) {
//         const warningsHtml = warnings
//         .map(
//             (warning) =>
//             `<div class="warning-item">
//                     <i class="fas ${warning.icon}"></i>
//                     ${warning.text}
//                 </div>`,
//         )
//         .join("")

//         warningsContainer.html(warningsHtml)
//     }
// }

// Clear route
// function clearRoute() {
//     if (startMarker) {
//         map.removeLayer(startMarker)
//         startMarker = null
//     }

//     if (endMarker) {
//         map.removeLayer(endMarker)
//         endMarker = null
//     }

//     if (routeControl) {
//         map.removeControl(routeControl)
//         routeControl = null
//     }

//     // Limpiar todas las capas excepto la base
//     map.eachLayer((layer) => {
//         if (layer instanceof L.Polyline || layer instanceof L.Marker) {
//         map.removeLayer(layer)
//         }
//     })

//     $("#routeInfoPanel").removeClass("show")
//     currentRoute = null
// }

// Clear form
// function clearForm() {
//     $("#routeForm")[0].reset()
//     $("#flammableWarning").addClass("d-none")
//     $(".autocomplete-suggestions").hide()
//     clearRoute()
//     setDefaultDates()
// }

// Set default dates
function setDefaultDates() {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    $("#startDate").val(today.toISOString().split("T")[0])
    $("#endDate").val(tomorrow.toISOString().split("T")[0])
    $("#departureTime").val("08:00")
}

// Initialize form validation
// function initializeFormValidation() {
//     // Real-time validation
//     $("#routeForm input, #routeForm select").on("blur", function () {
//         validateField($(this))
//     })

//     // Date validation
//     $("#startDate, #endDate").on("change", () => {
//         validateDates()
//     })
// }

// Validate individual field
function validateField($field) {
    const value = $field.val()
    const fieldType = $field.attr("type")
    let isValid = true

    // Remove previous validation classes
    $field.removeClass("is-valid is-invalid")

    if ($field.prop("required") && !value) {
        isValid = false
    } else if (fieldType === "number" && value <= 0) {
        isValid = false
    }

    $field.addClass(isValid ? "is-valid" : "is-invalid")
}

// Validate dates
function validateDates() {
    const startDate = new Date($("#startDate").val())
    const endDate = new Date($("#endDate").val())
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let isValid = true

    if (startDate < today) {
        $("#startDate").addClass("is-invalid").removeClass("is-valid")
        isValid = false
    } else {
        $("#startDate").addClass("is-valid").removeClass("is-invalid")
    }

    if (endDate < startDate) {
        $("#endDate").addClass("is-invalid").removeClass("is-valid")
        isValid = false
    } else {
        $("#endDate").addClass("is-valid").removeClass("is-invalid")
    }

    return isValid
}

// Save route
// function saveRoute() {
//     if (!currentRoute) {
//         alert("No hay ruta calculada para guardar")
//         return
//     }

//     const routeName = prompt("Ingrese un nombre para la ruta:")
//     if (!routeName) return

//     const savedRoutes = JSON.parse(localStorage.getItem("savedRoutes") || "[]")
//     const routeToSave = {
//         id: Date.now(),
//         name: routeName,
//         data: currentRoute.data,
//         stats: currentRoute.stats,
//         createdAt: new Date().toISOString(),
//     }

//     savedRoutes.push(routeToSave)
//     localStorage.setItem("savedRoutes", JSON.stringify(savedRoutes))

//     // Show success message
//     showSuccessMessage("Ruta guardada exitosamente")
// }

// Generate PDF
// function generatePDF() {
//     if (!currentRoute) {
//         alert("No hay ruta calculada para generar PDF")
//         return
//     }

//     const { jsPDF } = window.jspdf
//     const doc = new jsPDF()

//     // Título
//     doc.setFontSize(20)
//     doc.text("Plan de Viaje - CargoRoute Pro", 20, 30)

//     // Información de ruta
//     doc.setFontSize(14)
//     doc.text("Información de Ruta:", 20, 50)

//     doc.setFontSize(12)
//     doc.text(`Origen: ${currentRoute.data.startPoint}`, 20, 65)
//     doc.text(`Destino: ${currentRoute.data.endPoint}`, 20, 75)
//     doc.text(`Distancia: ${currentRoute.stats.distance} km`, 20, 85)
//     doc.text(`Tiempo estimado: ${Math.floor(currentRoute.stats.time / 60)}h ${currentRoute.stats.time % 60}min`, 20, 95)
//     doc.text(`Combustible aproximado: ${currentRoute.stats.fuel} L`, 20, 105)

//     // Información del vehículo
//     doc.setFontSize(14)
//     doc.text("Información del Vehículo:", 20, 125)

//     doc.setFontSize(12)
//     doc.text(`Tipo de tráiler: ${currentRoute.data.trailerType}`, 20, 140)
//     doc.text(
//         `Dimensiones: ${currentRoute.data.dimensions.length}m x ${currentRoute.data.dimensions.width}m x ${currentRoute.data.dimensions.height}m`,
//         20,
//         150,
//     )
//     doc.text(`Peso máximo: ${currentRoute.data.dimensions.maxWeight} kg`, 20, 160)

//     // Información de carga
//     doc.setFontSize(14)
//     doc.text("Información de Carga:", 20, 180)

//     doc.setFontSize(12)
//     doc.text(`Tipos de carga: ${currentRoute.data.cargoTypes.join(", ")}`, 20, 195)
//     doc.text(`Carga flamable: ${currentRoute.data.isFlammable ? "Sí" : "No"}`, 20, 205)

//     // Fechas
//     doc.setFontSize(14)
//     doc.text("Fechas del Viaje:", 20, 225)

//     doc.setFontSize(12)
//     doc.text(`Fecha de inicio: ${currentRoute.data.dates.startDate}`, 20, 240)
//     doc.text(`Fecha de fin: ${currentRoute.data.dates.endDate}`, 20, 250)
//     doc.text(`Hora de partida: ${currentRoute.data.dates.departureTime}`, 20, 260)

//     // Guardar PDF
//     doc.save("plan-de-viaje.pdf")

//     showSuccessMessage("PDF generado exitosamente")
// }

// Show success message
// function showSuccessMessage(message) {
//     const alertHtml = `
//             <div class="alert alert-success alert-dismissible fade show position-fixed" 
//                 style="top: 100px; right: 20px; z-index: 9999;" role="alert">
//                 <i class="fas fa-check-circle me-2"></i>
//                 ${message}
//                 <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
//             </div>
//         `

//     $("body").append(alertHtml)

//     // Auto-remove after 3 seconds
//     setTimeout(() => {
//         $(".alert-success").alert("close")
//     }, 3000)
// }

// Show/Hide loading
// function showLoading() {
//     $("#loadingOverlay").addClass("show")
// }

// function hideLoading() {
//     $("#loadingOverlay").removeClass("show")
// }

// Keyboard shortcuts
// $(document).on("keydown", (e) => {
//     // Ctrl/Cmd + B para toggle sidebar
//     if ((e.ctrlKey || e.metaKey) && e.key === "b") {
//         e.preventDefault()
//         toggleSidebar()
//     }

//     // F11 para fullscreen
//     if (e.key === "F11") {
//         e.preventDefault()
//         toggleFullscreen()
//     }

//     // Escape para cerrar sidebar en mobile
//     if (e.key === "Escape" && $(window).width() <= 768) {
//         closeSidebar()
//     }
// })

// Service Worker para PWA (opcional)
// if ("serviceWorker" in navigator) {
//     window.addEventListener("load", () => {
//         navigator.serviceWorker
//         .register("/sw.js")
//         .then((registration) => {
//             console.log("SW registered: ", registration)
//         })
//         .catch((registrationError) => {
//             console.log("SW registration failed: ", registrationError)
//         })
//     })
// }
