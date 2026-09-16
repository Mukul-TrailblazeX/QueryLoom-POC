import { motion as Motion } from "framer-motion";
import SectionTitle from "../components/section-title";
import { ExternalLinkIcon } from "lucide-react";
import { copy } from "../content";

export default function WorkflowSteps() {
    const { workflow } = copy;
    return (
        <section className="mt-32 relative" id="use-cases">
            <SectionTitle
                title={workflow.title}
                description={workflow.description}
            />

            <Motion.div className="relative space-y-20 md:space-y-30 mt-20"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex-col items-center hidden md:flex absolute left-1/2 -translate-x-1/2">
                    {workflow.steps.map((step, index) => (
                        <div key={step.id} className="contents">
                            <p className="flex items-center justify-center font-medium my-10 aspect-square glass p-2 rounded-full">
                                {String(step.id).padStart(2, "0")}
                            </p>
                            {index < workflow.steps.length - 1 && <div className="h-72 w-0.5 divider-line" />}
                        </div>
                    ))}
                </div>
                {workflow.steps.map((step, index) => (
                    <Motion.div key={index} className={`flex items-center justify-center gap-6 md:gap-20 ${index % 2 !== 0 ? 'flex-col md:flex-row-reverse' : 'flex-col md:flex-row'}`}
                        initial={{ y: 150, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: `${index * 0.15}`, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        <img src={step.image} alt={step.title} className="flex-1 h-auto w-full max-w-sm rounded-2xl" />
                        <div key={index} className="flex-1 flex flex-col gap-6 md:px-6 max-w-md">
                            <h3 className="text-2xl font-medium">
                                {step.title}
                            </h3>
                            <p className="text-muted text-sm/6 line-clamp-3 pb-2">
                                {step.description}
                            </p>
                            <a href={step.link} className="flex items-center gap-2 focus-ring rounded-md w-max">
                                {workflow.learnMore}
                                <ExternalLinkIcon className="size-4" />
                            </a>
                        </div>
                    </Motion.div>
                ))}
            </Motion.div>
        </section>
    );
}
