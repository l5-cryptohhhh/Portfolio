export default function CertCard({ cert }) {
    const open = () => window.open(cert.url, "_blank", "noopener");

    return (
        <article role="link" tabIndex={0}
            aria-label={`Apri ${cert.label}`}
            onClick={open}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
            }}
            className="group flex h-full cursor-pointer flex-col justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5227FF]">
            <i className="bi bi-patch-check text-3xl text-[#B497CF]"></i>
            <h3 className="mt-4 text-lg font-semibold leading-relaxed text-white sm:text-xl">{cert.label}</h3>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#B497CF] transition-colors group-hover:text-[#FF9FFC]">
                Apri attestato <i className="bi bi-arrow-up-right"></i>
            </span>
        </article>
    );
}
