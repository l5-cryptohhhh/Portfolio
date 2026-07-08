import { Routes, Route } from "react-router-dom";
import HomePage from "../assets/components/HomePage.jsx";
import ProjectsPage from "../assets/components/ProjectsPage.jsx";
import LiquidEther from "./components/LiquidEther/LiquidEther.jsx";

export default function App() {
    return (
        <>
            <div className="fixed inset-0 z-0">
                <LiquidEther
                    colors={["#5227FF", "#FF9FFC", "#B497CF"]}
                    mouseForce={20}
                    cursorSize={100}
                    resolution={0.5}
                    autoDemo={true}
                    autoSpeed={0.5}
                    autoIntensity={2.2}
                    autoResumeDelay={3000}
                />
            </div>
            <div className="relative z-10">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/progetti" element={<ProjectsPage />} />
                </Routes>
            </div>
        </>
    );
}
