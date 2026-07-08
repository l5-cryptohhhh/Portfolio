import { useState } from "react";
import Reveal from "./Reveal.jsx";
import ContactModal from "./ContactModal.jsx";

export default function Contact() {
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmation, setConfirmation] = useState(null);

    return (
        <section id="contatti" className="flex flex-1 items-center py-16 pt-24">
            <div className="mx-auto w-full max-w-6xl px-5">
                <Reveal as="div"
                    className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center backdrop-blur-xl sm:p-16">
                    <div aria-hidden="true"
                        className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[32rem] -translate-x-1/2 rounded-full bg-[#5227FF]/25 blur-3xl">
                    </div>
                    <h2 className="relative text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        Parliamo del <span className="bg-gradient-to-r from-[#5227FF] to-[#FF9FFC] bg-clip-text text-transparent">prossimo progetto</span>.
                    </h2>
                    <p className="relative mx-auto mt-4 max-w-xl text-lg text-white/60">
                        Hai un'idea, una posizione aperta o una domanda? Scrivimi — rispondo entro 24 ore.
                    </p>
                    <button type="button" onClick={() => setModalOpen(true)}
                        className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#5227FF] to-[#8f5bff] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(82,39,255,0.45)] transition hover:brightness-110">
                        <i className="bi bi-send"></i>Scrivimi
                    </button>
                </Reveal>

                {confirmation && (
                    <div id="conferma-box"
                        className="mx-auto mt-8 max-w-lg rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-6 backdrop-blur-xl">
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-emerald-300">
                            <i className="bi bi-check-circle-fill"></i>Messaggio ricevuto
                        </h3>
                        <ul className="mt-4 space-y-2 text-sm text-white/70">
                            <li><strong className="text-white">Nome</strong> — {confirmation.nome}</li>
                            <li><strong className="text-white">Email</strong> — {confirmation.email}</li>
                            <li><strong className="text-white">Motivo</strong> — {confirmation.motivo}</li>
                            <li><strong className="text-white">Data</strong> — {confirmation.data || "—"}</li>
                            <li><strong className="text-white">Messaggio</strong> — {confirmation.messaggio || "—"}</li>
                        </ul>
                        <button type="button" onClick={() => setConfirmation(null)}
                            className="mt-5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/85 transition hover:bg-white/10">
                            Chiudi
                        </button>
                    </div>
                )}
            </div>

            <ContactModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmitted={(data) => {
                    setConfirmation(data);
                    setModalOpen(false);
                    requestAnimationFrame(() => {
                        document.getElementById("conferma-box")
                            ?.scrollIntoView({ behavior: "smooth", block: "center" });
                    });
                }}
            />
        </section>
    );
}
