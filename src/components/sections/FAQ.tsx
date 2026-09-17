"use client";

import { useState } from "react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";

const FAQ_ITEMS = [
  {
    question: "How do clear aligners work?",
    answer:
      "Clear aligners are a series of custom-made, removable transparent trays that apply gentle, controlled pressure to gradually move your teeth into better positions. You switch to a new set of trays every 1–2 weeks as planned by your orthodontist, with progress monitored through regular check-ins.",
  },
  {
    question: "How many hours a day do I need to wear my aligners?",
    answer:
      "Most clear aligner systems require 20–22 hours of wear per day for predictable results, removing them only to eat, drink (other than water) and clean your teeth. Your orthodontist will explain the exact wear schedule for your specific treatment plan.",
  },
  {
    question: "How often do I need to visit the clinic during aligner treatment?",
    answer:
      "Visit frequency depends on your treatment plan, but aligner check-ins are typically spaced further apart than fixed-braces adjustments — often every 6 to 8 weeks. Your orthodontist will share a personalized monitoring schedule based on your case.",
  },
  {
    question: "What happens after my aligner treatment is complete?",
    answer:
      "Once active treatment is complete, you will be prescribed retainers to help hold your teeth in their new position. The type of retainer and how often it needs to be worn depends on your case. Retention is an essential part of the overall treatment journey and helps protect your results long-term.",
  },
  {
    question: "Are clear aligners suitable for adults?",
    answer:
      "Yes. Clear aligners are a popular option for adults, particularly those who prefer a discreet, removable appliance for work or social settings. Your orthodontist will carry out a full assessment to confirm whether aligners are clinically appropriate for your case.",
  },
  {
    question: "Can teenagers use clear aligners?",
    answer:
      "Selected teenage cases may be suitable for aligners, provided the patient can reliably commit to the required wear schedule. Compliance is critical for aligner treatment, so your orthodontist will assess both the clinical case and the wear-schedule fit before recommending this option.",
  },
  {
    question: "Are clear aligners better than braces?",
    answer:
      "Neither option is automatically better — it depends on the type of tooth movement required, your bite, age, lifestyle, compliance with wearing schedules, and treatment goals. Your orthodontist will explain which option is clinically suitable for your specific case.",
  },
] as const;

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  function toggleItem(index: number) {
    setActiveIndex((currentIndex) => (currentIndex === index ? null : index));
  }

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="bg-canvas-soft py-14 sm:py-20"
    >
      <Container className="flex flex-col gap-8 px-4 sm:gap-10 sm:px-8 lg:px-10">
        <SectionHeading
          id="faq-heading"
          eyebrow="FAQ"
          title="Frequently Asked Questions"
          description="Common questions about our treatments, appointments, clinic, and patient care."
          align="center"
        />

        <div className="mx-auto flex w-full max-w-4xl flex-col gap-3">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = activeIndex === index;
            const answerId = `faq-answer-${index}`;

            return (
              <article
                key={item.question}
                className={`overflow-hidden rounded-card border bg-card transition-colors duration-200 ${isOpen ? "border-gold-500/50" : "border-line"}`}
              >
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    onClick={() => toggleItem(index)}
                    className="flex min-h-16 w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-ink transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 sm:px-6 sm:text-lg"
                  >
                    <span>{item.question}</span>
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className={`h-5 w-5 flex-none text-gold-600 transition-transform duration-200 ease-out ${isOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                </h3>

                <div
                  id={answerId}
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                  aria-hidden={!isOpen}
                >
                  <div className="min-h-0 overflow-hidden">
                    <p className="border-t border-line px-5 pb-5 pt-4 text-sm leading-relaxed text-ink/70 sm:px-6 sm:text-base">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
