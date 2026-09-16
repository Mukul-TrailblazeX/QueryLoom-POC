import SectionTitle from "../components/section-title";
import { AudioLinesIcon, FileTextIcon, GlobeIcon, ImagesIcon, MessagesSquareIcon, SearchIcon } from "lucide-react";
import { motion as Motion } from "motion/react";
import { copy } from "../content";

export default function Features() {
    const { features } = copy;

    const featureIcons = [SearchIcon, FileTextIcon, MessagesSquareIcon, GlobeIcon, AudioLinesIcon, ImagesIcon];

    const featuresData = features.items.map((item, index) => ({
        ...item,
        icon: featureIcons[index],
    }));

    return (
        <section className="mt-32" id="features">
            <SectionTitle
                title={features.title}
                description={features.description}
            />

            <div className="flex flex-wrap items-center justify-center gap-6 mt-10 px-6">
                {featuresData.map((feature, index) => (
                    <Motion.div
                        key={index}
                        className="feature-card p-6 rounded-xl space-y-4 glass max-w-80 w-full"
                        initial={{ opacity: 0, y: 32 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                    >
                        <span className="feature-badge">
                            {String(index + 1).padStart(2, '0')}
                        </span>
                        <feature.icon className="feature-icon size-8.5" />
                        <h3 className="text-base font-medium">
                            {feature.title}
                        </h3>
                        <p className="text-muted line-clamp-2 pb-2">
                            {feature.description}
                        </p>
                    </Motion.div>
                ))}
            </div>
        </section>
    );
}
