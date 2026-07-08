export const PROJECTS = [
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

export const CERTS = [
    { label: "HTML5 / CSS3", url: "/certs/m1.pdf" },
    { label: "Loops / JavaScript / Variables / Objects / Arrays / Conditionals", url: "/certs/m2.pdf" },
    { label: "DOM / ES6 / JavaScript / BOM", url: "/certs/m3.pdf" },
    { label: "CSS3 / Animations / Flexbox / UX/UI", url: "/certs/m4.pdf" },
    { label: "Bootstrap / Sass / Claude Code", url: "/certs/m5.pdf" },
    { label: "API / Async/await / OOP / JSON", url: "/certs/m6.pdf" },
    { label: "React Ecosystem & Component-Driven Design / API Integration & Asynchronous Data / AI-Assisted Development / Claude Code / Prompt Engineering", url: "/certs/m7.pdf" }
];

export function hostOf(url) {
    try { return new URL(url).hostname.replace(/^www\./, ""); }
    catch { return "apri"; }
}
