import { motion as Motion } from "framer-motion";
import { copy } from "../content";

export default function TrustedCompanies() {
    const { trusted } = copy;
    const logos = trusted.logos;

    return (
        <Motion.section
            className="mt-14"
            initial={{ y: 150, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 70, mass: 1 }}
        >
            <p className="mt-14 py-6 text-center text-sm font-medium tracking-[0.08em] uppercase text-subtle">
                {trusted.line}
            </p>

            <div
                className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-4 py-4 sm:grid-cols-3 lg:grid-cols-5"
                id="logo-container"
            >
                {logos.map((logo, index) => (
                    <div
                        key={logo}
                        className="trusted-logo-chip flex min-h-20 items-center justify-center rounded-2xl px-6 py-5"
                    >
                        <img
                            src={logo}
                            alt={`${trusted.logoAltPrefix} ${index + 1}`}
                            className="trusted-logo h-7 w-auto max-w-full object-contain sm:h-8"
                            loading="lazy"
                        />
                    </div>
                ))}
            </div>
        </Motion.section>
    );
}
