import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Treatments from "@/components/sections/Treatments";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import Dentist from "@/components/sections/Dentist";
import Testimonials from "@/components/sections/Testimonials";
import FAQ from "@/components/sections/FAQ";
import Gallery from "@/components/sections/Gallery";
import LocationHours from "@/components/sections/LocationHours";
import AppointmentCTA from "@/components/sections/AppointmentCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Treatments />
      <WhyChooseUs />
      <Dentist />
      <Testimonials />
      <FAQ />
      <Gallery />
      <LocationHours />
      <AppointmentCTA />
    </>
  );
}
