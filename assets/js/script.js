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
            const submitBtn = form.querySelector("button[type=submit]");
            submitBtn.disabled = true;

            fetch("https://formsubmit.co/ajax/nunziatamanuel5@gmail.com", {
                method: "POST",
                headers: { "Accept": "application/json" },
                body: new FormData(form)
            })
                .then((res) => { if (!res.ok) throw new Error("send failed"); })
                .then(() => {
                    $("#conf-nome").textContent = get("nome");
                    $("#conf-email").textContent = get("email");
                    $("#conf-motivo").textContent = $("#motivo").value;
                    $("#conf-data").textContent = $("#data").value || "—";
                    $("#conf-messaggio").textContent = get("messaggio") || "—";

                    confermaBox.hidden = false;
                    modal.close();
                    form.reset();
                    confermaBox.scrollIntoView({ behavior: "smooth", block: "center" });
                })
                .catch(() => {
                    alert("Invio non riuscito. Riprova o scrivimi direttamente a nunziatamanuel5@gmail.com.");
                })
                .finally(() => { submitBtn.disabled = false; });
        });

        const chiudi = $("#chiudi-conferma-btn");
        if (chiudi) chiudi.addEventListener("click", () => { confermaBox.hidden = true; });
    }

    /* ============================================================
       Projects — hardcoded list, edit this array to add/remove projects
       ============================================================ */
    const PROJECTS = [
        {
            title: "MonkeyCode",
            tag: "HTML · CSS · JavaScript",
            desc: "Benchmark di 20 domande randomiche sulle competenze front-end.",
            link: "https://gabrieleleonardi21.github.io/Build-week-1/"
        },
        {
            title: "MusiCode",
            tag: "HTML · CSS · JavaScript",
            desc: "Clone app musicale, simile a Spotify.",
            link: "https://l5-cryptohhhh.github.io/Build-week-2/"
        },
        {
            title: "Autocon",
            tag: "React · JavaScript",
            desc: "App di collegamento e automazione tra strumenti per lavoro.",
            link: "https://l5-cryptohhhh.github.io/Autocon"
        },
        {
            title: "Agente AI Email/Calendario",
            tag: "Node.js · Claude API · Tool Use",
            desc: "Agente che legge email e calendario, propone azioni (rispondi, schedula) e chiede approvazione umana prima di eseguirle.",
            link: "https://l5-cryptohhhh.github.io/agentmailcalendar/"
        }
    ];

    function cardHTML(p) {
        return `
            <article class="project-card">
                <div class="pc-top"><span class="pc-tag">${escapeHTML(p.tag)}</span></div>
                <h3>${escapeHTML(p.title)}</h3>
                <p class="pc-desc">${escapeHTML(p.desc)}</p>
                <a class="pc-link" href="${p.link}" target="_blank" rel="noopener">
                    Apri su ${escapeHTML(hostOf(p.link))} <i class="bi bi-arrow-up-right"></i>
                </a>
            </article>`;
    }

    function renderProjects() {
        $$("[data-projects]").forEach((grid) => {
            grid.innerHTML = PROJECTS.length
                ? PROJECTS.map(cardHTML).join("")
                : `<p class="projects-empty">Ancora nessun progetto.</p>`;
        });
        $$(".project-card").forEach((card) => {
            card.addEventListener("mousemove", (e) => {
                const r = card.getBoundingClientRect();
                card.style.setProperty("--mx", `${e.clientX - r.left}px`);
                card.style.setProperty("--my", `${e.clientY - r.top}px`);
            });
        });
    }

    /* ============================================================
       Attestati — hardcoded list, edit this array to add/remove certs.
       Put files under assets/certs/ and reference them here.
       ============================================================ */
    const CERTS = [
        { label: "HTML5 / CSS3", url: "assets/certs/m1.pdf" },
        { label: "Loops / JavaScript / Variables / Objects / Arrays / Conditionals", url: "assets/certs/m2.pdf" },
        { label: "DOM / ES6 / JavaScript / BOM", url: "assets/certs/m3.pdf" },
        { label: "CSS3 / Animations / Flexbox / UX/UI", url: "assets/certs/m4.pdf" },
        { label: "Bootstrap / Sass / Claude Code", url: "assets/certs/m5.pdf" },
        { label: "API / Async/await / OOP / JSON", url: "assets/certs/m6.pdf" },
        { label: "React Ecosystem & Component-Driven Design / API Integration & Asynchronous Data / AI-Assisted Development / Claude Code / Prompt Engineering", url: "assets/certs/m7.pdf" }
    ];

    function certCardHTML(c) {
        return `
            <article class="cert-card" data-href="${escapeHTML(c.url)}" role="link" tabindex="0"
                aria-label="Apri ${escapeHTML(c.label)}">
                <i class="bi bi-patch-check cert-ic"></i>
                <h3>${escapeHTML(c.label)}</h3>
                <span class="cert-open">Apri attestato <i class="bi bi-arrow-up-right"></i></span>
            </article>`;
    }

    function renderCerts() {
        const grid = $("[data-certs]");
        if (!grid) return;

        if (CERTS.length === 0) {
            grid.innerHTML = `<p class="projects-empty">Nessun attestato ancora.</p>`;
            return;
        }
        grid.innerHTML = CERTS.map(certCardHTML).join("");

        $$(".cert-card", grid).forEach((card) => {
            const open = () => window.open(card.dataset.href, "_blank", "noopener");
            card.addEventListener("click", open);
            card.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
            });
        });
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
        renderProjects();
        renderCerts();
        initReveal();
        initNav();
    });
})();
