import SectionTitle from "../components/section-title";
import { motion as Motion } from "framer-motion";
import { useRef } from "react";
import { copy } from "../content";

export default function Testimonials() {
    const { testimonials } = copy;

    const ref = useRef([]);
    const data = testimonials.items;
    return (
        <section className="mt-32 flex flex-col items-center" id="testimonials">
            <SectionTitle
                title={testimonials.title}
                description={testimonials.description}
            />
            <div className='mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                {data.map((item, index) => (
                    <Motion.div key={index} className='w-full max-w-88 space-y-5 rounded-lg glass p-5 hover:-translate-y-1'
                        initial={{ y: 150, opacity: 0 }}
                        ref={(el) => (ref.current[index] = el)}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: `${index * 0.15}`, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                        onAnimationComplete={() => {
                            const card = ref.current[index];
                            if (card) {
                                card.classList.add("transition", "duration-300");
                            }
                        }}
                    >
                        <div className='flex items-center justify-between'>
                            <p className="font-medium">{item.about}</p>
                            <img className='size-10 rounded-full' src={item.image} alt={item.name} />
                        </div>
                        <p className='line-clamp-3'>"{item.review}"</p>
                        <p className='text-soft'>
                            - {item.name}
                        </p>
                    </Motion.div>
                ))}
            </div>
        </section>
    );
}
