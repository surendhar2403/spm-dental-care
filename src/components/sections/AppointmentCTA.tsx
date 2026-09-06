"use client";

import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import SmileDivider from "@/components/ui/SmileDivider";
import AppointmentForm from "@/components/sections/AppointmentForm";
import { useAppointmentModal } from "@/components/appointment/AppointmentModalContext";
import { CONTACT } from "@/lib/constants";
import { buildTelUrl, buildWhatsAppUrl } from "@/lib/utils";

export default function AppointmentCTA() {
  const { openModal } = useAppointmentModal();

  return (
    <section
      id="appointment"
      aria-labelledby="appointment-heading"
      className="bg-blue-900 py-14 text-canvas sm:py-16"
    >
      <Container className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16">
        <div className="flex flex-1 flex-col gap-6">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-500">
            Contact &amp; appointments
          </span>
          <h2 id="appointment-heading" className="max-w-lg text-3xl font-medium sm:text-4xl">
            Reach out or request an appointment
          </h2>
          <SmileDivider colorClassName="text-gold-500" />

          <dl className="flex flex-col gap-2 text-sm text-canvas/80">
            <div>
              <dt className="inline font-medium text-canvas">Phone: </dt>
              <dd className="inline">
                <a href={buildTelUrl(CONTACT.phone)} className="hover:text-canvas">
                  {CONTACT.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="inline font-medium text-canvas">WhatsApp: </dt>
              <dd className="inline">{CONTACT.whatsapp}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-4 pt-2">
            <Button type="button" onClick={openModal} variant="primary">
              Book Appointment
            </Button>
            <Button href={buildTelUrl(CONTACT.phone)} variant="secondary">
              Call Now
            </Button>
            <Button
              href={buildWhatsAppUrl(
                CONTACT.whatsapp,
                "Hi, I'd like to book an appointment at SPM Dental Care.",
              )}
              variant="secondary"
            >
              WhatsApp
            </Button>
            <Button href={CONTACT.mapsUrl} variant="secondary">
              Get Directions
            </Button>
          </div>
        </div>

        <div className="flex-1">
          <AppointmentForm />
        </div>
      </Container>
    </section>
  );
}
