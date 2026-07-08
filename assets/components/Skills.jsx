import Reveal from "./Reveal.jsx";

const GROUPS = [
    {
        icon: "bi-window-stack",
        title: "Frontend",
        tags: ["HTML5", "CSS3", "JavaScript", "TypeScript", "React", "Responsive", "Accessibilità"],
    },
    {
        icon: "bi-hdd-network",
        title: "Backend",
        tags: ["Node.js", "Express", "Python", "REST API", "PostgreSQL", "MongoDB", "Auth / JWT"],
    },
    {
        icon: "bi-stars",
        title: "AI & LLM",
        tags: ["Claude API", "OpenAI API", "Prompt design", "RAG", "Embeddings", "Tool use"],
    },
    {
        icon: "bi-tools",
        title: "Tooling",
        tags: ["Git & GitHub", "VS Code", "Vite", "npm", "Markdown", "Postman"],
    },
];

export default function Skills() {
    return (
        <section id="competenze" className="flex flex-1 items-center py-16 pt-24">
            <div className="mx-auto w-full max-w-6xl px-5">
                <Reveal as="div" className="max-w-2xl">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        Lo stack su cui lavoro <span className="bg-gradient-to-r from-[#5227FF] to-[#FF9FFC] bg-clip-text text-transparent">ogni giorno</span>.
                    </h2>
                    <p className="mt-3 text-lg text-white/60">
                        Strumenti scelti per arrivare in produzione, non solo per il demo del venerdì.
                    </p>
                </Reveal>
                <div className="mt-12 grid gap-5 sm:grid-cols-2">
                    {GROUPS.map((g) => (
                        <Reveal as="article" key={g.title}
                            className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition-colors hover:border-white/20">
                            <h3 className="flex items-center gap-3 text-lg font-semibold text-white">
                                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#5227FF]/30 to-[#FF9FFC]/20 text-[#B497CF]">
                                    <i className={`bi ${g.icon}`}></i>
                                </span>
                                {g.title}
                            </h3>
                            <ul className="mt-5 flex flex-wrap gap-2">
                                {g.tags.map((t) => (
                                    <li key={t}
                                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                                        {t}
                                    </li>
                                ))}
                            </ul>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
