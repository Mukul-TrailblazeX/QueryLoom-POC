import { ArrowRightIcon } from "lucide-react";
import { motion as Motion } from "framer-motion";
import { copy } from "../content";

export default function CallToAction({ onLaunchApp }) {
    const { cta } = copy;
    return (
        <Motion.div className="flex flex-col max-w-5xl mt-40 px-4 mx-auto items-center justify-center text-center py-16 rounded-xl glass"
            initial={{ y: 150, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 320, damping: 70, mass: 1 }}
        >
            <Motion.h2 className="text-2xl md:text-4xl font-medium mt-2"
                initial={{ y: 80, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 280, damping: 70, mass: 1 }}
            >
                {cta.title}
            </Motion.h2>
            <Motion.p className="mt-4 text-sm/7 max-w-md"
                initial={{ y: 80, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, damping: 70, mass: 1 }}
            >
                {cta.description}
            </Motion.p>
            <Motion.button className="btn glass transition-none flex items-center gap-2 mt-8 focus-ring" type="button" aria-label={cta.buttonText}
                initial={{ y: 80, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 280, damping: 70, mass: 1 }}
                onClick={onLaunchApp}
            >
                {cta.buttonText}
                <ArrowRightIcon className="size-4" />
            </Motion.button>
        </Motion.div>
    );
};
