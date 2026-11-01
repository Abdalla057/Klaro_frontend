import PublicLayout from "../layouts/PublicLayout";
import { Cta, Faq, Features, ForWho, Hero, Pillars, Plans, Steps } from "../components";

export function LandingPage() {
  return (
    <PublicLayout>
      <Hero />
      <Pillars />
      <Features />
      <Steps />
      <ForWho />
      <Plans />
      <Faq />
      <Cta />
    </PublicLayout>
  );
}

export default LandingPage;
