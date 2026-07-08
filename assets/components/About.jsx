import Reveal from "./Reveal.jsx";

const FACTS = [
    { dt: "Base", dd: "Latina, Italia" },
    { dt: "Ruolo", dd: "Full-Stack AI Dev" },
    { dt: "Formazione", dd: "Epicode 2026" },
    { dt: "Focus", dd: "Web + LLM" },
];

export default function About() {
    return (
        <section id="chi-sono" className="flex flex-1 items-center py-16 pt-24">
            <div className="mx-auto w-full max-w-6xl px-5">
                <Reveal as="div">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        Da marketing a codice, <span className="bg-gradient-to-r from-[#5227FF] to-[#FF9FFC] bg-clip-text text-transparent">con metodo</span>.
                    </h2>
                </Reveal>
                <div className="mt-10 grid gap-10 md:grid-cols-[1.4fr_1fr]">
                    <Reveal className="space-y-5 text-lg leading-relaxed text-white/60">
                        <p>
                            Ho chiuso il percorso full-stack di <strong className="text-white">Epicode</strong> e oggi lavoro su entrambi i
                            lati dello stack: backend solidi in Node.js e Python, frontend reattivi in React, e
                            integrazioni con modelli AI per dare alle applicazioni capacità che prima richiedevano
                            interi team.
                        </p>
                        <p>
                            Vengo dal marketing, quindi non guardo solo al codice: penso a chi userà il prodotto, a
                            cosa lo rende chiaro e a cosa lo fa scegliere. Leggo documentazione tecnica per piacere e
                            preferisco capire come funziona una cosa prima di usarla.
                        </p>
                    </Reveal>
                    <Reveal as="dl" className="grid grid-cols-2 gap-3 self-start">
                        {FACTS.map((f) => (
                            <div key={f.dt}
                                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
                                <dt className="font-mono text-xs uppercase tracking-wider text-white/45">{f.dt}</dt>
                                <dd className="mt-1 text-sm font-semibold text-white">{f.dd}</dd>
                            </div>
                        ))}
                    </Reveal>
                </div>
            </div>
        </section>
    );
}
