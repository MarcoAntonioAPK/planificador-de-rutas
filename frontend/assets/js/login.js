import { api } from "../../services/api.js";

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
        const data = await api.login(form.email.value.trim(), form.password.value);
        setMessage(`Hola, ${data.user.name}. Acceso correcto.`, true);
        window.setTimeout(() => window.location.assign("gestion.html"), 700);
    } catch (error) {
        const networkMessage = "No se pudo conectar con el backend. Comprueba que Django esté activo en el puerto 8001 y que el origen de Go Live esté autorizado en CORS.";
        setMessage(error instanceof TypeError ? networkMessage : error.message);
    } finally {
        submit.disabled = false;
    }
});
