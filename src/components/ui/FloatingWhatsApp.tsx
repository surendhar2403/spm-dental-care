import { CONTACT } from "@/lib/constants";
import { buildWhatsAppUrl } from "@/lib/utils";

export default function FloatingWhatsApp() {
  return (
    <a
      href={buildWhatsAppUrl(
        CONTACT.whatsapp,
        "Hi, I'd like to book an appointment at SPM Dental Care.",
      )}
      aria-label="Contact SPM Dental Care on WhatsApp"
      title="Contact us on WhatsApp"
      className="fixed bottom-[78px] right-4 z-[9999] inline-flex h-[50px] w-[50px] animate-[pulse_3s_ease-in-out_infinite] items-center justify-center rounded-full border border-white/30 bg-[#25D366] text-white shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-105 hover:bg-[#20bd5a] hover:shadow-[0_12px_28px_rgba(0,0,0,0.28)] focus-visible:outline-none motion-reduce:animate-none md:bottom-[145px] md:right-7 md:h-[52px] md:w-[155px] md:gap-2 md:rounded-full md:px-4"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      >
        <path d="M20.1 3.9A11.2 11.2 0 0 0 12.2 1C6 1 1 6 1 12.2c0 2 .5 3.9 1.5 5.6L1 23l5.4-1.4a11.2 11.2 0 0 0 5.7 1.5h.1c6.1 0 11.1-5 11.1-11.1 0-3-1.1-5.9-3.2-8.1Z" />
        <path d="M8.1 6.8c.2-.4.5-.4.8-.4h.6c.2 0 .4.1.5.4l.9 2.2c.1.2.1.4 0 .6l-.6.9c-.1.2-.1.4 0 .6.4.8 1.1 1.5 1.8 2 .6.5 1.3.8 2 .9.2 0 .4 0 .5-.2l.9-1.1c.1-.2.4-.3.6-.2l2.2 1c.2.1.3.3.3.5v.6c0 .4-.2.8-.5 1.1-.5.5-1.2.8-1.9.8-1.7 0-3.5-.8-5.2-2.2-1.5-1.2-2.8-2.8-3.5-4.4-.4-1-.3-2.2.2-3.1Z" />
      </svg>
      <span className="hidden whitespace-nowrap text-sm font-semibold md:inline">WhatsApp Us</span>
    </a>
  );
}
