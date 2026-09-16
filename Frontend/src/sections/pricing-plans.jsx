import SectionTitle from "../components/section-title";
import { CheckIcon, CrownIcon, RocketIcon, ZapIcon } from "lucide-react";
import { motion as Motion } from "framer-motion";
import { useRef } from "react";
import { copy } from "../content";

export default function PricingPlans() {
    const { pricing } = copy;
    const ref = useRef([]);
    const icons = [RocketIcon, ZapIcon, CrownIcon];
    const data = pricing.plans.map((plan, index) => ({ ...plan, icon: icons[index] }));

    return (
        <section className="mt-32" id="pricing">
            <SectionTitle
                title={pricing.title}
                description={pricing.description}
            />

            <div className='mt-12 flex flex-wrap items-center justify-center gap-6'>
                {data.map((item, index) => (
                    <Motion.div key={index} className='group w-full max-w-80 glass p-6 rounded-xl hover:-translate-y-0.5'
                        initial={{ y: 150, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: `${index * 0.15}`, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                        ref={(el) => (ref.current[index] = el)}
                        onAnimationComplete={() => {
                            const card = ref.current[index];
                            if (card) {
                                card.classList.add("transition", "duration-300");
                            }
                        }}
                    >
                        <div className="flex items-center w-max ml-auto text-xs gap-2 glass rounded-full px-3 py-1">
                            <item.icon className='size-3.5' />
                            <span>{item.title}</span>
                        </div>
                        <h3 className='mt-4 text-2xl font-semibold'>
                            {item.price} <span className='text-sm font-normal'>{pricing.perMonth}</span>
                        </h3>
                        <p className='text-subtle mt-3'>{item.description}</p>
                        <button type="button" className={`mt-7 rounded-md w-full btn focus-ring ${item.mostPopular ? 'btn-primary' : 'glass btn-ghost'}`} aria-label={item.buttonText}>
                            {item.buttonText}
                        </button>
                        <div className='mt-6 flex flex-col'>
                            {item.features.map((feature, index) => (
                                <div key={index} className='flex items-center gap-2 py-2'>
                                    <div className='rounded-full glass border-0 p-1'>
                                        <CheckIcon className='size-3' strokeWidth={3} />
                                    </div>
                                    <p className="text-muted">{feature}</p>
                                </div>
                            ))}
                        </div>
                    </Motion.div>
                ))}
            </div>
        </section>
    );
}