import React from "react";
import {
  HeroSection,
  HowItWorksSection,
  UrgencyLevelsSection,
  SafetyPromiseSection,
  CtaBannerSection,
  MobileStickyEmergencyBar,
} from "@/components/landing";

export default function Home() {
  return (
    <div className="flex-1 w-full max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col pb-16 sm:pb-8">
      <HeroSection />
      <HowItWorksSection />
      <UrgencyLevelsSection />
      <SafetyPromiseSection />
      <CtaBannerSection />
      <MobileStickyEmergencyBar />
    </div>
  );
}
