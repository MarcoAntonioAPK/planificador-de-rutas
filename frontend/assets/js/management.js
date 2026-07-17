(() => { "use strict";
    const labels = { superadmin: ["SuperAdmin", "Todas las empresas", "Control global"], admin: ["Administrador", "Salzillo", "Empresa completa"], planner: ["Ana Torres", "Salzillo", "Planificadora"], driver: ["José Ríos", "Salzillo", "Chofer"] };
    function render(role) { document.querySelectorAll("[data-roles]").forEach((el) => { el.hidden = !el.dataset.roles.split(",").includes(role); }); const [name, company, label] = labels[role]; document.querySelector("#profileName").textContent=name; document.querySelector("#profileRole").textContent=label; document.querySelector("#companyLabel").textContent=company; document.documentElement.style.setProperty("--primary", role === "admin" || role === "planner" || role === "driver" ? "#7c3aed" : "#2563eb"); }
    document.querySelector("#rolePreview").addEventListener("change", (event) => render(event.target.value));
    document.querySelector("#addCompany").addEventListener("click", () => document.querySelector("#companyDialog").showModal());
    document.querySelector("#addMember").addEventListener("click", () => document.querySelector("#memberDialog").showModal());
    render("superadmin");
})();
