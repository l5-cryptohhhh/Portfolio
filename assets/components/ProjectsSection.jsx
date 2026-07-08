import Reveal from "./Reveal.jsx";
import ProjectGrid from "./ProjectGrid.jsx";

export default function ProjectsSection() {
    return (
        <section id="progetti" className="flex flex-1 items-center py-16 pt-24">
            <div className="mx-auto w-full max-w-6xl px-5">
                <Reveal as="div" className="max-w-2xl">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        Cose che ho <span className="bg-gradient-to-r from-[#5227FF] to-[#FF9FFC] bg-clip-text text-transparent">costruito</span>.
                    </h2>
                    <p className="mt-3 text-lg text-white/60">Una selezione dei miei progetti.</p>
                </Reveal>
                <div className="mt-12">
                    <ProjectGrid />
                </div>
            </div>
        </section>
    );
}
