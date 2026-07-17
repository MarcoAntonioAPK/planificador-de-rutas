const baseUrl = window.PLANIFICADOR_CONFIG?.apiUrl || window.PLANIFICADOR_API_URL || "http://localhost:8001/api/v1";

async function request(path, options = {}) {
    const headers = { ...options.headers };
    if (options.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
    if (options.method && options.method !== "GET") {
        const csrfResponse = await fetch(`${baseUrl}/auth/csrf/`, { credentials: "include" });
        headers["X-CSRFToken"] = (await csrfResponse.json()).csrfToken;
    }
    const response = await fetch(`${baseUrl}/${path}`, { credentials: "include", ...options, headers });
    const data = response.status === 204 ? {} : await response.json();
    if (!response.ok) throw new Error(data.message || "No se pudo completar la solicitud.");
    return data;
}

export const api = {
    login: (email, password) => request("auth/login/", { method: "POST", body: JSON.stringify({ email, password }) }),
    register: (profile) => request("auth/register/", { method: "POST", body: JSON.stringify(profile) }),
    resetPassword: (email) => request("auth/password-reset/", { method: "POST", body: JSON.stringify({ email }) }),
    profile: () => request("auth/me/")
};
