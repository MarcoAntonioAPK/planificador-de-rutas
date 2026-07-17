(() => {
    "use strict";
    const API_URL = window.ROUTEFLOW_API_URL || "http://localhost:8001/api/v1";
    const form = document.querySelector("#loginForm");
    const message = document.querySelector("#loginMessage");
    const password = document.querySelector("#password");

    function setMessage(text, success = false) {
        message.textContent = text;
        message.classList.add("show");
        message.classList.toggle("success", success);
    }

    document.querySelector("#togglePassword").addEventListener("click", (event) => {
        const visible = password.type === "text";
        password.type = visible ? "password" : "text";
        event.currentTarget.setAttribute("aria-label", visible ? "Mostrar contraseña" : "Ocultar contraseña");
        event.currentTarget.querySelector("i").className = visible ? "fa-regular fa-eye" : "fa-regular fa-eye-slash";
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const submit = form.querySelector("button[type=submit]");
        submit.disabled = true;
        message.classList.remove("show");
        try {
            const csrfResponse = await fetch(`${API_URL}/auth/csrf/`, { credentials: "include" });
            const { csrfToken } = await csrfResponse.json();
            const response = await fetch(`${API_URL}/auth/login/`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json", "X-CSRFToken": csrfToken },
                body: JSON.stringify({ email: form.email.value.trim(), password: form.password.value })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "No se pudo iniciar sesión.");
            setMessage(`Hola, ${data.user.name}. Acceso correcto.`, true);
            window.setTimeout(() => window.location.assign("index.html"), 700);
        } catch (error) {
            setMessage(error.message === "Failed to fetch" ? "No se pudo conectar con el servidor." : error.message);
        } finally {
            submit.disabled = false;
        }
    });
})();
