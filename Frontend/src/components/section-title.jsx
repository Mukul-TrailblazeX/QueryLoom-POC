import { motion as Motion } from "framer-motion";

export default function SectionTitle({ title, description }) {
    return (
        <div className="text-center">
            <Motion.h2 className="text-3xl font-semibold max-w-lg mx-auto mt-4"
                initial={{ y: 120, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 320, damping: 70, mass: 1 }}
            >
                {title}
            </Motion.h2>
            <Motion.p className="mt-4 text-center text-sm/7 text-muted max-w-md mx-auto"
                initial={{ y: 120, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1 }}
            >
                {description}
            </Motion.p>
        </div>
    )
}