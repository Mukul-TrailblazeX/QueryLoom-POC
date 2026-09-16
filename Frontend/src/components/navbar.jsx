import { MenuIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import { copy } from "../content";
import Brand from "./brand";
import ThemeToggleButton from "./theme-toggle-button";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { links, cta, logoAlt, menuOpenLabel, menuCloseLabel } = copy.navbar;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <Motion.nav
        className={`sticky top-0 z-50 flex w-full items-center justify-between px-4 py-3.5 md:px-16 lg:px-24 transition-colors ${isScrolled ? "bg-surface/90 backdrop-blur-lg border-b border-[var(--color-border)]" : ""}`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1 }}
      >
        <a href="/" className="flex items-center shrink-0 focus-ring rounded-md" aria-label={logoAlt}>
          <Brand />
        </a>

        <div className="hidden items-center gap-4 lg:gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="transition hover:text-soft focus-ring rounded-md"
            >
              {link.name}
            </a>
          ))}
          <ThemeToggleButton />
          <a href="/" className="btn btn-signup focus-ring">
            {cta}
          </a>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="transition active:scale-90 md:hidden focus-ring rounded-md"
          aria-label={menuOpenLabel}
        >
          <MenuIcon className="size-6.5" />
        </button>
      </Motion.nav>

      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-surface/90 text-lg font-medium backdrop-blur-2xl transition duration-300 md:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {links.map((link) => (
          <a key={link.name} href={link.href} onClick={() => setIsOpen(false)} className="focus-ring rounded-md">
            {link.name}
          </a>
        ))}

        <ThemeToggleButton />
        <a href="/" className="btn btn-signup focus-ring" onClick={() => setIsOpen(false)}>
          {cta}
        </a>
        <button
          onClick={() => setIsOpen(false)}
          className="rounded-md p-2 glass focus-ring"
          aria-label={menuCloseLabel}
        >
          <XIcon />
        </button>
      </div>
    </>
  );
}
