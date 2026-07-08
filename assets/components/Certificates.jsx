import Reveal from "./Reveal.jsx";
import { CERTS } from "./data.js";
import CertCard from "./CertCard.jsx";
import ScrollStack, { ScrollStackItem } from "../../src/components/ScrollStack/ScrollStack.jsx";

export default function Certificates() {
    return (
        <section id="attestati" className="flex flex-1 items-center py-16 pt-24">
            <div className="mx-auto w-full max-w-6xl px-5">
                <Reveal as="div" className="max-w-2xl">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        <span className="bg-gradient-to-r from-[#5227FF] to-[#FF9FFC] bg-clip-text text-transparent">Attestati</span>
                    </h2>
                    <p className="mt-3 text-lg text-white/60">Certificati e diplomi. Scorri lo stack, clicca una card per aprirla.</p>
                </Reveal>
                <div className="mt-8 h-[55vh]">
                    {CERTS.length ? (
                        <ScrollStack
                            itemDistance={80}
                            itemStackDistance={24}
                            baseScale={0.88}
                            stackPosition="12%"
                            scaleEndPosition="6%"
                        >
                            {CERTS.map((c) => (
                                <ScrollStackItem key={c.url}>
                                    <CertCard cert={c} />
                                </ScrollStackItem>
                            ))}
                        </ScrollStack>
                    ) : (
                        <p className="text-white/50">Nessun attestato ancora.</p>
                    )}
                </div>
            </div>
        </section>
    );
}
