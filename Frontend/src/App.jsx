import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import LenisScroll from "./components/lenis-scroll";
import CardNav from "./components/CardNav";
import Footer from "./components/footer";
import HeroSection from "./sections/hero-section";
import FaqSection from "./sections/faq-section";
import TrustedCompanies from "./sections/trusted-companies";
import Features from "./sections/features";
import WorkflowSteps from "./sections/workflow-steps";
import Testimonials from "./sections/testimonials";
import PricingPlans from "./sections/pricing-plans";
import CallToAction from "./sections/call-to-action";
import { copy } from "./content";
import AuthPage from "./auth/AuthPage";
import ChatPage from "./chat/ChatPage";
import { getAuthSession } from "./auth/session";

function LandingPage() {
    const navigate = useNavigate();

    const navItems = [
        {
            label: "Product",
            bgColor: "var(--color-surface-strong)",
            textColor: "var(--color-text)",
            links: [
                { label: "Home", href: "#home", ariaLabel: "Go to home section" },
                { label: "Features", href: "#features", ariaLabel: "Go to features section" }
            ]
        },
        {
            label: "Workflow",
            bgColor: "var(--color-accent-soft)",
            textColor: "var(--color-text)",
            links: [
                { label: "Use Cases", href: "#use-cases", ariaLabel: "Go to use cases section" },
                { label: "Docs", href: "#docs", ariaLabel: "Go to docs section" }
            ]
        },
        {
            label: "Explore",
            bgColor: "var(--color-surface)",
            textColor: "var(--color-text)",
            links: [
                { label: "Testimonials", href: "#testimonials", ariaLabel: "Go to testimonials section" },
                { label: "Pricing", href: "#pricing", ariaLabel: "Go to pricing section" }
            ]
        }
    ];

    return (
        <div className="relative min-h-screen">
            <LenisScroll />
            <CardNav
                logo="/assets/logo.svg"
                darkLogo="/assets/logo-dark.svg"
                logoAlt={copy.navbar.logoAlt}
                items={navItems}
                baseColor="var(--color-surface)"
                menuColor="var(--color-text)"
                buttonBgColor="var(--color-accent)"
                buttonTextColor="var(--color-accent-contrast)"
                primaryButtonLabel={copy.hero.primaryCta}
                secondaryButtonLabel={copy.navbar.cta}
                onSignUpClick={() => navigate("/auth?mode=signup")}
                onPrimaryButtonClick={() => navigate("/app")}
                ease="power3.out"
            />
            <main className="px-4 pt-24 md:pt-28">
                <HeroSection onLaunchApp={() => navigate("/app")} onGetStarted={() => navigate("/app")} />
                <TrustedCompanies />
                <Features />
                <WorkflowSteps />
                <Testimonials />
                <FaqSection />
                <PricingPlans />
                <CallToAction onLaunchApp={() => navigate("/app")} />
            </main>
            <Footer />
        </div>
    );
}

export default function App() {
    function ProtectedChatRoute() {
        const location = useLocation();
        const session = getAuthSession();

        if (!session?.accessToken) {
            return <Navigate to="/auth?mode=signin" replace state={{ from: location.pathname }} />;
        }

        return <ChatPage />;
    }

    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/add-account" element={<AuthPage />} />
            <Route path="/app" element={<ProtectedChatRoute />} />
            <Route path="/chat" element={<ProtectedChatRoute />} />
            <Route path="/chat/:chatId" element={<ProtectedChatRoute />} />
            <Route path="/chats" element={<ProtectedChatRoute />} />
        </Routes>
    );
}
