import { useEffect, useState } from "react";
import Nav from "./Nav.jsx";
import Hero from "./Hero.jsx";
import About from "./About.jsx";
import ProjectsSection from "./ProjectsSection.jsx";
import Skills from "./Skills.jsx";
import Certificates from "./Certificates.jsx";
import Contact from "./Contact.jsx";
import Footer from "./Footer.jsx";

const SECTIONS = {
    "#top": Hero,
    "#chi-sono": About,
    "#progetti": ProjectsSection,
    "#competenze": Skills,
    "#attestati": Certificates,
    "#contatti": Contact,
};

export default function HomePage() {
    const [section, setSection] = useState("#top");

    useEffect(() => {
        // all'apertura/refresh si riparte SEMPRE da Home
        if (window.location.hash) {
            history.replaceState(null, "", window.location.pathname);
        }

        const onHash = () => {
            const hash = window.location.hash;
            setSection(SECTIONS[hash] ? hash : "#top");
            window.scrollTo(0, 0);
        };
        window.addEventListener("hashchange", onHash);
        return () => window.removeEventListener("hashchange", onHash);
    }, []);

    const Active = SECTIONS[section] ?? Hero;

    return (
        <div className="flex min-h-dvh flex-col">
            <Nav />
            <main id="top" className="flex flex-1 flex-col">
                <Active />
            </main>
            <Footer />
        </div>
    );
}
