import { api } from "../../services/api.js";
(() => {
    "use strict";
    const form = document.querySelector("form");
    const message = document.querySelector("#formMessage");
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const button = form.querySelector("button[type=submit],button:not([type])"); button.disabled = true;
        try {
            const isRegister = form.id === "registerForm";
            const body = Object.fromEntries(new FormData(form));
            if (body.companyId) body.companyId = Number(body.companyId);
            const data = isRegister ? await api.register(body) : await api.resetPassword(body.email);
            message.textContent = isRegister ? "Cuenta creada. Redirigiendo…" : data.message; message.className = "form-message show success";
            if (isRegister) window.setTimeout(() => window.location.assign("index.html"), 800);
        } catch (error) { message.textContent = error.message || "No se pudo completar la solicitud."; message.className = "form-message show"; }
        finally { button.disabled = false; }
    });
})();
