import { PROJECTS } from "./data.js";
import ProjectCard from "./ProjectCard.jsx";

export default function ProjectGrid() {
    if (!PROJECTS.length) {
        return <p className="text-white/50">Ancora nessun progetto.</p>;
    }
    return (
        <div className="grid gap-5 sm:grid-cols-2">
            {PROJECTS.map((p) => <ProjectCard project={p} key={p.title} />)}
        </div>
    );
}
