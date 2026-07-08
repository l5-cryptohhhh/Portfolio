import { useEffect, useState } from "react";
import Lanyard from "../../src/components/Lanyard/Lanyard.jsx";
import TiltedCard from "../../src/components/TiltedCard/TiltedCard.jsx";
import TrueFocus from "../../src/components/TrueFocus/TrueFocus.jsx";

// Rende Lanyard solo >= 768px: con display:none il Canvas 3D girerebbe comunque
function useIsDesktop() {
    const [isDesktop, setIsDesktop] = useState(
        () => typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches
    );
    useEffect(() => {
        const mq = window.matchMedia("(min-width: 768px)");
        const onChange = (e) => setIsDesktop(e.matches);
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, []);
    return isDesktop;
}

export default function Hero() {
    const isDesktop = useIsDesktop();
    return (
        <header className="relative flex flex-1 items-center pt-16">
            <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-10 md:grid-cols-[1.2fr_0.8fr]">
                <div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 font-mono text-xs tracking-wide text-white/70 backdrop-blur">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
                        </span>
                        Disponibile per nuovi progetti
                    </span>
                    <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
                        Costruisco prodotti web<br />
                        con un{" "}
                        <TrueFocus
                            sentence="cervello AI"
                            manualMode={false}
                            blurAmount={5}
                            borderColor="#5227FF"
                            glowColor="rgba(82, 39, 255, 0.6)"
                            animationDuration={0.5}
                            pauseBetweenAnimations={1}
                        />
                        .
                    </h1>
                    <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/60">
                        Sono Manuel Nunziata, full-stack AI developer. Progetto e sviluppo applicazioni end-to-end —
                        dal database all'interfaccia — integrando modelli di linguaggio dove fanno davvero la
                        differenza.
                    </p>
                    <div className="mt-9 flex flex-wrap gap-4">
                        <a href="#progetti"
                            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#5227FF] to-[#8f5bff] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(82,39,255,0.45)] transition hover:brightness-110">
                            <i className="bi bi-folder2-open"></i>Vedi i progetti
                        </a>
                        <a href="#contatti"
                            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/85 backdrop-blur transition hover:border-white/30 hover:bg-white/10">
                            <i className="bi bi-send"></i>Contattami
                        </a>
                    </div>
                </div>
                {/* < 768px: TiltedCard; >= 768px: Lanyard 3D */}
                {isDesktop ? (
                    <div className="relative h-[60vh] w-full">
                        <Lanyard
                            position={[0, 0, 24]}
                            gravity={[0, -40, 0]}
                            frontImage="/img/userimg.png"
                            imageFit="cover"
                        />
                    </div>
                ) : (
                    <div className="flex w-full items-center justify-center">
                        <TiltedCard
                            imageSrc="/img/userimg.png"
                            altText="Manuel Nunziata"
                            captionText="Manuel Nunziata"
                            containerHeight="300px"
                            containerWidth="300px"
                            imageHeight="300px"
                            imageWidth="300px"
                            rotateAmplitude={12}
                            scaleOnHover={1.2}
                            showMobileWarning={false}
                            showTooltip={true}
                            displayOverlayContent={true}
                            overlayContent={
                                <p className="tilted-card-demo-text m-2 rounded-full bg-black/50 px-4 py-1 text-sm font-semibold text-white backdrop-blur">
                                    Manuel Nunziata
                                </p>
                            }
                        />
                    </div>
                )}
            </div>
        </header>
    );
}
