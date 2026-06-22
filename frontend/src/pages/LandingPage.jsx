import { Navbar } from '../components/landing/Navbar';
import { Hero } from '../components/landing/Hero';
import { AppPreview } from '../components/landing/AppPreview';
import { PainPoints } from '../components/landing/PainPoints';
import { HowItWorks } from '../components/landing/HowItWorks';
import { Features } from '../components/landing/Features';
import { Pricing } from '../components/landing/Pricing';
import { BetaProgram } from '../components/landing/BetaProgram';
import { FAQ } from '../components/landing/FAQ';
import { FinalCTA } from '../components/landing/FinalCTA';
import { Footer } from '../components/landing/Footer';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-[var(--color-landing-primary)] selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <AppPreview />
        <PainPoints />
        <HowItWorks />
        <Features />
        <Pricing />
        <BetaProgram />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};
