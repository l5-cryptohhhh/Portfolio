/* ============================================================
   Portfolio — Manuel Nunziata
   Contact modal · Dynamic projects (localStorage) · UI helpers
   ============================================================ */
(function () {
    "use strict";

    /* ---------- Utils ---------- */
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    function escapeHTML(str) {
        return String(str).replace(/[&<>"']/g, (c) => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        }[c]));
    }

    // Only allow http/https links (blocks javascript: and friends)
    function safeURL(raw) {
        try {
            const u = new URL(raw.trim());
            return (u.protocol === "http:" || u.protocol === "https:") ? u.href : null;
        } catch {
            return null;
        }
    }

    function hostOf(url) {
        try { return new URL(url).hostname.replace(/^www\./, ""); }
        catch { return "apri"; }
    }

    /* ============================================================
       Generic modal open/close (focus management + Esc + overlay)
       ============================================================ */
    function setupModal(overlay, { openers = [], closers = [], onOpen } = {}) {
        if (!overlay) return null;
        let lastFocus = null;

        function open() {
            lastFocus = document.activeElement;
            overlay.classList.add("open");
            overlay.setAttribute("aria-hidden", "false");
            const first = overlay.querySelector("input, button, select, textarea");
            if (first) first.focus();
            if (onOpen) onOpen();
        }
        function close() {
            overlay.classList.remove("open");
            overlay.setAttribute("aria-hidden", "true");
            if (lastFocus) lastFocus.focus();
        }

        openers.forEach((b) => b && b.addEventListener("click", open));
        closers.forEach((b) => b && b.addEventListener("click", close));
        overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && overlay.classList.contains("open")) close();
        });
        return { open, close };
    }

    /* ============================================================
       Contact form
       ============================================================ */
    function initContact() {
        const overlay = $("#contact-modal");
        if (!overlay) return;

        const modal = setupModal(overlay, {
            openers: [$("#open-modal-btn")],
            closers: [$("#close-modal-btn"), $("#annulla-btn")]
        });

        const form = $("#contact-form");
        const confermaBox = $("#conferma-box");

        form.addEventListener("submit", (e) => {
            e.preventDefault();
            if (!form.checkValidity()) { form.reportValidity(); return; }

            const get = (id) => $("#" + id).value.trim();
            $("#conf-nome").textContent = get("nome");
            $("#conf-email").textContent = get("email");
            $("#conf-motivo").textContent = $("#motivo").value;
            $("#conf-data").textContent = $("#data").value || "—";
            $("#conf-messaggio").textContent = get("messaggio") || "—";

            confermaBox.hidden = false;
            modal.close();
            form.reset();
            confermaBox.scrollIntoView({ behavior: "smooth", block: "center" });
        });

        const chiudi = $("#chiudi-conferma-btn");
        if (chiudi) chiudi.addEventListener("click", () => { confermaBox.hidden = true; });
    }

    /* ============================================================
       Projects — store + render (localStorage)
       ============================================================ */
    const STORAGE_KEY = "mn_projects_v1";

    const SEED = [
        {
            id: "seed-ricetta",
            title: "Pagina Ricetta",
            tag: "HTML semantico",
            desc: "Titolo, ingredienti e procedura. Esercizio di markup applicato a un contenuto reale.",
            link: "https://github.com/l5-cryptohhhh"
        },
        {
            id: "seed-card",
            title: "Card di Presentazione",
            tag: "HTML · CSS",
            desc: "Biglietto digitale con nome, ruolo e link social. Sintesi sulla struttura della pagina.",
            link: "https://github.com/l5-cryptohhhh"
        },
        {
            id: "seed-portfolio",
            title: "Questo Portfolio",
            tag: "HTML · CSS · JS",
            desc: "Portfolio personale con sezione progetti dinamica salvata nel browser.",
            link: "https://github.com/l5-cryptohhhh"
        }
    ];

    function loadProjects() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw === null) { saveProjects(SEED); return SEED.slice(); }
            const data = JSON.parse(raw);
            return Array.isArray(data) ? data : SEED.slice();
        } catch {
            return SEED.slice();
        }
    }

    function saveProjects(list) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
        catch { /* storage piena o disabilitata: la sessione resta in memoria */ }
    }

    let projects = loadProjects();

    function cardHTML(p) {
        const safe = safeURL(p.link) || "#";
        const tag = p.tag
            ? `<span class="pc-tag">${escapeHTML(p.tag)}</span>`
            : `<span class="pc-tag">progetto</span>`;
        const desc = p.desc
            ? `<p class="pc-desc">${escapeHTML(p.desc)}</p>`
            : `<p class="pc-desc"></p>`;
        return `
            <article class="project-card" data-id="${escapeHTML(p.id)}">
                <button class="pc-remove" type="button" aria-label="Rimuovi ${escapeHTML(p.title)}">
                    <i class="bi bi-trash3"></i>
                </button>
                <div class="pc-top">${tag}</div>
                <h3>${escapeHTML(p.title)}</h3>
                ${desc}
                <a class="pc-link" href="${safe}" target="_blank" rel="noopener">
                    Apri su ${escapeHTML(hostOf(safe))} <i class="bi bi-arrow-up-right"></i>
                </a>
            </article>`;
    }

    function render() {
        $$("[data-projects]").forEach((grid) => {
            const limit = parseInt(grid.dataset.limit || "0", 10);
            const list = limit > 0 ? projects.slice(0, limit) : projects;

            let html = list.map(cardHTML).join("");

            if (list.length === 0) {
                html = `<p class="projects-empty">Ancora nessun progetto. Aggiungine uno.</p>`;
            }
            // Add-card always last (unless we hit the visible limit on the home grid)
            const hiddenByLimit = limit > 0 && projects.length >= limit;
            if (!hiddenByLimit) {
                html += `
                    <button class="project-add" type="button" data-add-project>
                        <i class="bi bi-plus-circle"></i>
                        Aggiungi progetto
                    </button>`;
            }
            grid.innerHTML = html;
        });
        wireCards();
    }

    function wireCards() {
        // Remove
        $$(".pc-remove").forEach((btn) => {
            btn.addEventListener("click", () => {
                const card = btn.closest(".project-card");
                const id = card && card.dataset.id;
                if (!id) return;
                if (!confirm("Rimuovere questo progetto?")) return;
                projects = projects.filter((p) => p.id !== id);
                saveProjects(projects);
                render();
            });
        });

        // Spotlight follow
        $$(".project-card").forEach((card) => {
            card.addEventListener("mousemove", (e) => {
                const r = card.getBoundingClientRect();
                card.style.setProperty("--mx", `${e.clientX - r.left}px`);
                card.style.setProperty("--my", `${e.clientY - r.top}px`);
            });
        });

        // Open add modal
        $$("[data-add-project]").forEach((b) => b.addEventListener("click", () => {
            if (projectModal) projectModal.open();
        }));
    }

    /* ---------- Add-project modal ---------- */
    let projectModal = null;

    function initProjects() {
        if ($$("[data-projects]").length === 0) return;

        const overlay = $("#project-modal");
        const form = $("#project-form");

        projectModal = setupModal(overlay, {
            closers: [$("#close-project-btn"), $("#annulla-project-btn")],
            onOpen: () => clearErrors()
        });

        function clearErrors() {
            $$("[data-error-for]").forEach((el) => (el.textContent = ""));
        }
        function showError(field, msg) {
            const el = $(`[data-error-for="${field}"]`);
            if (el) el.textContent = msg;
        }

        if (form) {
            form.addEventListener("submit", (e) => {
                e.preventDefault();
                clearErrors();

                const title = $("#proj-title").value.trim();
                const tag = $("#proj-tag").value.trim();
                const desc = $("#proj-desc").value.trim();
                const linkRaw = $("#proj-link").value.trim();

                let ok = true;
                if (!title) { showError("proj-title", "Il titolo è obbligatorio."); ok = false; }
                const link = safeURL(linkRaw);
                if (!link) { showError("proj-link", "Inserisci un URL valido (http/https)."); ok = false; }
                if (!ok) return;

                projects.unshift({
                    id: "p-" + Date.now().toString(36),
                    title, tag, desc, link
                });
                saveProjects(projects);
                render();
                form.reset();
                projectModal.close();
            });
        }

        render();
    }

    /* ============================================================
       Scroll reveal — enhances already-visible content
       ============================================================ */
    function initReveal() {
        const items = $$("[data-reveal]");
        if (!items.length) return;

        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduce || !("IntersectionObserver" in window)) {
            items.forEach((el) => el.classList.add("is-visible"));
            return;
        }
        const io = new IntersectionObserver((entries, obs) => {
            entries.forEach((en) => {
                if (en.isIntersecting) {
                    en.target.classList.add("is-visible");
                    obs.unobserve(en.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
        items.forEach((el) => io.observe(el));
    }

    /* ============================================================
       Nav — mobile toggle + active link on scroll
       ============================================================ */
    function initNav() {
        const toggle = $("#nav-toggle");
        const menu = $("#nav-menu");
        if (toggle && menu) {
            toggle.addEventListener("click", () => {
                const open = menu.classList.toggle("open");
                toggle.setAttribute("aria-expanded", String(open));
            });
            menu.addEventListener("click", (e) => {
                if (e.target.tagName === "A") {
                    menu.classList.remove("open");
                    toggle.setAttribute("aria-expanded", "false");
                }
            });
        }

        const links = $$("#nav-menu a[href^='#']");
        const sections = links
            .map((a) => $(a.getAttribute("href")))
            .filter(Boolean);
        if (!sections.length || !("IntersectionObserver" in window)) return;

        const spy = new IntersectionObserver((entries) => {
            entries.forEach((en) => {
                if (en.isIntersecting) {
                    const id = en.target.id;
                    links.forEach((a) =>
                        a.classList.toggle("active", a.getAttribute("href") === "#" + id));
                }
            });
        }, { rootMargin: "-45% 0px -50% 0px" });
        sections.forEach((s) => spy.observe(s));
    }

    /* ---------- Boot ---------- */
    document.addEventListener("DOMContentLoaded", () => {
        initContact();
        initProjects();
        initReveal();
        initNav();
    });
})();
