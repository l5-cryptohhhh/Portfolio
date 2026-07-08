import { Link } from "react-router-dom";

const LINKS = [
    { to: "/#chi-sono", label: "Chi sono" },
    { to: "/#competenze", label: "Competenze" },
    { to: "/#attestati", label: "Attestati" },
    { to: "/#contatti", label: "Contatti" },
];

export default function NavProjects() {
    return (
        <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#08050f]/60 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
                <Link to="/" className="flex items-center gap-2.5 font-semibold tracking-tight text-white">
                    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[#5227FF] to-[#FF9FFC] shadow-[0_0_12px_#5227FF]"></span>
                    Manuel Nunziata
                </Link>
                <ul className="hidden items-center gap-1 md:flex">
                    {LINKS.map((l) => (
                        <li key={l.to}>
                            <Link to={l.to}
                                className="block rounded-lg px-3.5 py-2 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white">
                                {l.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}
