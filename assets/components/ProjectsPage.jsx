import { Link } from "react-router-dom";
import Reveal from "./Reveal.jsx";
import NavProjects from "./NavProjects.jsx";
import ProjectGrid from "./ProjectGrid.jsx";
import Footer from "./Footer.jsx";

export default function ProjectsPage() {
    return (
        <div className="flex min-h-dvh flex-col">
            <NavProjects />
            <main className="flex-1">
                <section id="progetti" className="pt-32 pb-24">
                    <div className="mx-auto max-w-6xl px-5">
                        <div className="flex flex-wrap items-end justify-between gap-6">
                            <Reveal as="div" className="max-w-2xl">
                                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                    Tutti i <span className="bg-gradient-to-r from-[#5227FF] to-[#FF9FFC] bg-clip-text text-transparent">progetti</span>.
                                </h2>
                                <p className="mt-3 text-lg text-white/60">I lavori che ho realizzato finora.</p>
                            </Reveal>
                            <Reveal as={Link} to="/"
                                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/85 backdrop-blur transition hover:bg-white/10">
                                <i className="bi bi-arrow-left"></i> Torna alla home
                            </Reveal>
                        </div>
                        <div className="mt-12">
                            <ProjectGrid />
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
