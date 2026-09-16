import { PlayCircleIcon } from "lucide-react";
import { motion as Motion } from "framer-motion";
import { copy } from "../content";
import TextType from "../components/TextType";
import Particles from "../components/Particles";
import { useTheme } from "../context/use-theme";

export default function HeroSection({ onLaunchApp, onGetStarted }) {
    const { hero } = copy;
    const { theme } = useTheme();
    const particleColors =
        theme === "dark"
            ? ["#f0ede8", "#ddd6ca", "#c8c1b5"]
            : ["#1a1a1a", "#5a544b", "#8f8678"];

    return (
        <Motion.section id="home" className="relative isolate flex min-h-[calc(100vh-76px)] flex-col items-center justify-center overflow-visible">
            <div
                className="absolute left-0 top-0 w-full pointer-events-none"
                style={{ height: "180vh", zIndex: 0 }}
                aria-hidden="true"
            >
                <div style={{ width: "100%", height: "180vh", position: "absolute", top: 0, left: 0 }}>
                    <Particles
                        particleColors={particleColors}
                        particleCount={760}
                        particleSpread={16}
                        speed={0.12}
                        particleBaseSize={145}
                        sizeRandomness={1.25}
                        cameraDistance={18}
                        moveParticlesOnHover={false}
                        alphaParticles={true}
                        disableRotation={false}
                    />
                </div>
            </div>
            <Motion.div className="relative z-[1] flex items-center gap-3 mt-32"
                initial={{ y: -20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
            >
                <p>{hero.badge}</p>
                <button
                    className="btn glass py-1 px-3 text-xs focus-ring"
                    type="button"
                    aria-label={hero.launchLabel}
                    onClick={onLaunchApp}
                >
                    {hero.launchLabel}
                </button>
            </Motion.div>
            <Motion.h1 className="relative z-[1] text-center text-4xl/12 md:text-6xl/18 mt-5 font-semibold tracking-normal max-w-4xl"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
            >
                Understand documents with{" "}
                <TextType
                    as="span"
                    text={["calm AI", "clear summaries", "focused research"]}
                    typingSpeed={75}
                    pauseDuration={1500}
                    showCursor={true}
                    cursorCharacter="|"
                    className="text-soft"
                />
            </Motion.h1>
            <Motion.p className="relative z-[1] text-center text-muted text-base/7 max-w-md mt-6"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
            >
                {hero.subtitle}
            </Motion.p>

            <Motion.div className="relative z-[1] flex flex-col md:flex-row max-md:w-full items-center gap-4 md:gap-3 mt-6"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 320, damping: 70, mass: 1 }}
            >
                <button
                    className="btn btn-primary max-md:w-full py-3 focus-ring"
                    type="button"
                    aria-label={hero.primaryCta}
                    onClick={onGetStarted}
                >
                    {hero.primaryCta}
                </button>
                <button className="btn max-md:w-full glass flex items-center justify-center gap-2 py-3 focus-ring" type="button" aria-label={hero.secondaryCta}>
                    <PlayCircleIcon className="size-4.5" />
                    {hero.secondaryCta}
                </button>
            </Motion.div>
        </Motion.section>
    );
}
