import { hostOf } from "./data.js";
import ElectricBorder from "../../src/components/ElectricBorder/ElectricBorder.jsx";

export default function ProjectCard({ project }) {
    function onMouseMove(e) {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
    }

    return (
        <ElectricBorder color="#5227FF" speed={1} chaos={0.12} borderRadius={16} className="h-full">
        <article onMouseMove={onMouseMove}
            className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition-colors hover:border-[#5227FF]/50">
            <div aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: "radial-gradient(280px circle at var(--mx, 50%) var(--my, 50%), rgba(82,39,255,0.18), transparent 70%)" }}>
            </div>
            <span className="relative self-start rounded-full border border-[#B497CF]/30 bg-[#5227FF]/15 px-3 py-1 font-mono text-[11px] tracking-wide text-[#CBB6E8]">
                {project.tag}
            </span>
            <h3 className="relative mt-4 text-xl font-semibold text-white">{project.title}</h3>
            <p className="relative mt-2 flex-1 text-sm leading-relaxed text-white/60">{project.desc}</p>
            <a href={project.link} target="_blank" rel="noopener"
                className="relative mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#B497CF] transition-colors hover:text-[#FF9FFC]">
                Apri su {hostOf(project.link)} <i className="bi bi-arrow-up-right"></i>
            </a>
        </article>
        </ElectricBorder>
    );
}
