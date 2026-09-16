import { DribbbleIcon, GithubIcon, LinkedinIcon, TwitterIcon } from "lucide-react";
import { motion as Motion } from "framer-motion";
import { copy } from "../content";
import Brand from "./brand";

export default function Footer() {
    const { footer } = copy;
    const socialIcons = [DribbbleIcon, LinkedinIcon, TwitterIcon, GithubIcon];

    return (
        <Motion.footer className="flex flex-col items-center px-4 md:px-16 lg:px-24 justify-center w-full pt-16 mt-40 border-t border-[var(--color-border)] bg-surface"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
        >
            <a href="/" className="flex items-center shrink-0 focus-ring rounded-md" aria-label={footer.logoAlt}>
                <Brand />
            </a>

            <div className="flex flex-wrap items-center justify-center gap-8 py-8">
                {footer.legalLinks.map((link, index) => (
                    <a key={index} href={link.href} className='transition hover:text-[var(--color-text-soft)] focus-ring rounded-md'>
                        {link.name}
                    </a>
                ))}
            </div>
            <div className="flex items-center gap-6 pb-6">
                {footer.socialLinks.map((link, index) => {
                    const Icon = socialIcons[index];
                    return (
                        <a key={link.name} href={link.href} className="hover:-translate-y-0.5 text-subtle transition-all duration-300 focus-ring rounded-md" aria-label={link.name}>
                            <Icon />
                        </a>
                    );
                })}
            </div>
            <hr className="w-full border-[var(--color-border)] mt-6" />
            <div className="flex flex-col md:flex-row items-center w-full justify-between gap-4 py-4">
                <p className="sr-only">{footer.srLabel}</p>
                <p>{footer.copyright}</p>
            </div>
        </Motion.footer>
    );
};
