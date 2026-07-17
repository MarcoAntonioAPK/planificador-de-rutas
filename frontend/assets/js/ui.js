(() => {
    "use strict";

    const sidebar = document.querySelector("#sidebar");
    const sidebarToggle = document.querySelector("#sidebarToggle");
    const toast = document.querySelector("#appToast");
    let toastTimeout;

    function toggleSidebar() {
        const isOpen = sidebar.classList.toggle("open");
        sidebarToggle.setAttribute("aria-expanded", String(isOpen));
    }

    function showToast(message, type = "success") {
        window.clearTimeout(toastTimeout);
        toast.querySelector("span").textContent = message;
        toast.classList.toggle("error", type === "error");
        toast.classList.add("show");
        toastTimeout = window.setTimeout(() => toast.classList.remove("show"), 3200);
    }

    function setLoading(isLoading) {
        const button = document.querySelector("#calculateRouteBtn");
        button.classList.toggle("is-loading", isLoading);
        button.disabled = isLoading;
        button.querySelector("span").textContent = isLoading ? "Calculando ruta…" : "Calcular ruta óptima";
    }

    function useCurrentLocation(event) {
        const targetId = event.currentTarget.dataset.useLocation;
        if (!navigator.geolocation) {
            showToast("La geolocalización no está disponible en este navegador.", "error");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                document.querySelector(`#${targetId}`).value = `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
                showToast("Ubicación actualizada correctamente.");
            },
            () => showToast("No pudimos acceder a tu ubicación.", "error"),
            { enableHighAccuracy: true, timeout: 8000 }
        );
    }

    sidebarToggle.addEventListener("click", toggleSidebar);
    document.querySelectorAll("[data-use-location]").forEach((button) => button.addEventListener("click", useCurrentLocation));
    document.querySelector("#departureAt").value = new Date(Date.now() + 3600000).toISOString().slice(0, 16);
    document.querySelector("#newTruckBtn").addEventListener("click", () => document.querySelector("#truckDialog").showModal());
    document.querySelector("#saveZoneBtn").addEventListener("click", () => document.querySelector("#zoneDialog").showModal());
    document.querySelector("#toggleZonesBtn").addEventListener("click", (event) => {
        event.currentTarget.classList.toggle("active");
        showToast(event.currentTarget.classList.contains("active") ? "Mostrando todas las zonas de Chihuahua." : "Zonas guardadas ocultas.");
    });
    document.querySelector("#exportPdfBtn").addEventListener("click", () => window.print());
    document.querySelectorAll("dialog form").forEach((form) => form.addEventListener("submit", (event) => {
        if (event.submitter?.value === "save") showToast("La información se guardó correctamente.");
    }));

    window.addEventListener("routeflow:toast", ({ detail }) => showToast(detail.message, detail.type));
    window.addEventListener("routeflow:loading", ({ detail }) => setLoading(detail));
    window.addEventListener("routeflow:calculated", () => {
        if (window.innerWidth <= 720 && sidebar.classList.contains("open")) toggleSidebar();
    });
})();
