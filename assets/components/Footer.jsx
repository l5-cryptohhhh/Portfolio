export default function Footer() {
    return (
        <footer className="border-t border-white/10 bg-[#08050f]/60 backdrop-blur-xl">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row">
                <p className="text-sm text-white/50">&copy; 2026 Manuel Nunziata — Full-Stack AI Developer</p>
                <span className="flex gap-2">
                    <a href="https://www.linkedin.com/in/manuel-nunziata-800494372/" target="_blank" rel="noopener"
                        aria-label="LinkedIn"
                        className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:border-[#5227FF]/50 hover:text-white">
                        <i className="bi bi-linkedin"></i>
                    </a>
                    <a href="https://github.com/l5-cryptohhhh" target="_blank" rel="noopener" aria-label="GitHub"
                        className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:border-[#5227FF]/50 hover:text-white">
                        <i className="bi bi-github"></i>
                    </a>
                    <a href="https://mail.google.com/mail/?view=cm&fs=1&to=nunziatamanuel5@gmail.com" target="_blank"
                        rel="noopener" aria-label="Email"
                        className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:border-[#5227FF]/50 hover:text-white">
                        <i className="bi bi-envelope"></i>
                    </a>
                </span>
            </div>
        </footer>
    );
}
