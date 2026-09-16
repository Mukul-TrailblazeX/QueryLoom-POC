import SectionTitle from '../components/section-title';
import { ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';
import { motion as Motion } from "framer-motion";
import { copy } from "../content";

export default function FaqSection() {
    const [isOpen, setIsOpen] = useState(null);
    const { faq } = copy;

    return (
        <section className='mt-32' id="docs">
            <SectionTitle title={faq.title} description={faq.description} />
            <div className='mx-auto mt-12 space-y-4 w-full max-w-xl'>
                {faq.items.map((item, index) => (
                    <Motion.div key={index} className='flex flex-col glass rounded-md'
                        initial={{ y: 150, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: `${index * 0.15}`, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        <h3>
                            <button
                                type="button"
                                className='flex w-full cursor-pointer hover:bg-[var(--color-surface)] transition items-start justify-between gap-4 p-4 font-medium focus-ring rounded-md'
                                onClick={() => setIsOpen(isOpen === index ? null : index)}
                                aria-expanded={isOpen === index}
                                aria-controls={`faq-answer-${index}`}
                            >
                                {item.question}
                                <ChevronDownIcon className={`size-5 transition-all shrink-0 duration-400 ${isOpen === index ? 'rotate-180' : ''}`} />
                            </button>
                        </h3>
                        <p id={`faq-answer-${index}`} className={`px-4 text-sm/6 text-muted transition-all duration-400 overflow-hidden ${isOpen === index ? 'pt-2 pb-4 max-h-80' : 'max-h-0'}`}>{item.answer}</p>
                    </Motion.div>
                ))}
            </div>
        </section>
    );
}