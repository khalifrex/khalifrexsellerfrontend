import { CallToAction } from "../components/landingpage/CTA";
import { HeroSection } from "../components/landingpage/HeroSection";
import { Navbar } from "../components/landingpage/navbar";
import { WhySellSection } from "../components/landingpage/WhySellOnKhalifrex";

export default function KhalifrexLanding() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <WhySellSection />
      <CallToAction />
    </div>
  );
}