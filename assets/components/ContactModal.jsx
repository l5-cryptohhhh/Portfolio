import { useEffect, useRef } from "react";

const FIELD =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-[#5227FF] focus:ring-2 focus:ring-[#5227FF]/40";
const LABEL = "mt-4 mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50";

export default function ContactModal({ open, onClose, onSubmitted }) {
    const overlayRef = useRef(null);
    const formRef = useRef(null);
    const lastFocus = useRef(null);

    useEffect(() => {
        if (open) {
            lastFocus.current = document.activeElement;
            const first = overlayRef.current?.querySelector("input, button, select, textarea");
            if (first) first.focus();
        } else if (lastFocus.current) {
            lastFocus.current.focus();
        }
    }, [open]);

    useEffect(() => {
        function onKeydown(e) {
            if (e.key === "Escape" && open) onClose();
        }
        document.addEventListener("keydown", onKeydown);
        return () => document.removeEventListener("keydown", onKeydown);
    }, [open, onClose]);

    async function handleSubmit(e) {
        e.preventDefault();
        const form = formRef.current;
        if (!form.checkValidity()) { form.reportValidity(); return; }

        const submitBtn = form.querySelector("button[type=submit]");
        submitBtn.disabled = true;

        const data = Object.fromEntries(new FormData(form).entries());

        try {
            const res = await fetch("https://formsubmit.co/ajax/nunziatamanuel5@gmail.com", {
                method: "POST",
                headers: { Accept: "application/json" },
                body: new FormData(form)
            });
            if (!res.ok) throw new Error("send failed");

            onSubmitted({
                nome: data.nome?.trim() || "",
                email: data.email?.trim() || "",
                motivo: data.motivo || "",
                data: data.data || "",
                messaggio: data.messaggio?.trim() || ""
            });
            form.reset();
        } catch {
            alert("Invio non riuscito. Riprova o scrivimi direttamente a nunziatamanuel5@gmail.com.");
        } finally {
            submitBtn.disabled = false;
        }
    }

    return (
        <div ref={overlayRef} role="dialog"
            aria-modal="true" aria-labelledby="modal-title" aria-hidden={!open}
            onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
            className={`fixed inset-0 z-[100] items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm ${open ? "flex" : "hidden"}`}>
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0d0918]/95 p-7 shadow-2xl backdrop-blur-2xl">
                <div className="flex items-center justify-between">
                    <h3 id="modal-title" className="text-xl font-bold text-white">Contattami</h3>
                    <button type="button" aria-label="Chiudi" onClick={onClose}
                        className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-white/60 transition hover:bg-white/10 hover:text-white">
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>
                <p className="mt-1 text-sm text-white/50">Compila il form, ti rispondo personalmente.</p>
                <form ref={formRef} onSubmit={handleSubmit} noValidate>
                    <input type="hidden" name="_subject" value="Nuovo messaggio dal portfolio" readOnly />
                    <input type="hidden" name="_captcha" value="false" readOnly />
                    <input type="text" name="_honey" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />

                    <label htmlFor="nome" className={LABEL}>Nome completo *</label>
                    <input type="text" id="nome" name="nome" placeholder="Mario Rossi" required className={FIELD} />

                    <label htmlFor="email" className={LABEL}>Email *</label>
                    <input type="email" id="email" name="email" placeholder="nome@esempio.it" required className={FIELD} />

                    <label htmlFor="motivo" className={LABEL}>Motivo del contatto</label>
                    <select id="motivo" name="motivo" defaultValue="Proposta di lavoro" className={`${FIELD} [&>option]:bg-[#0d0918]`}>
                        <option value="Proposta di lavoro">Proposta di lavoro</option>
                        <option value="Collaborazione">Collaborazione</option>
                        <option value="Richiesta informazioni">Richiesta informazioni</option>
                        <option value="Altro">Altro</option>
                    </select>

                    <label htmlFor="data" className={LABEL}>Data di nascita</label>
                    <input type="date" id="data" name="data" className={`${FIELD} [color-scheme:dark]`} />

                    <label htmlFor="messaggio" className={LABEL}>Messaggio</label>
                    <textarea id="messaggio" name="messaggio" rows="4" placeholder="Raccontami in due righe..." className={FIELD}></textarea>

                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose}
                            className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/85 transition hover:bg-white/10">
                            Annulla
                        </button>
                        <button type="submit"
                            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#5227FF] to-[#8f5bff] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(82,39,255,0.45)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">
                            <i className="bi bi-send"></i>Invia
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
