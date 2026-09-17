"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAppointmentModal } from "@/components/appointment/AppointmentModalContext";

const PROMPTS = ["Need dental help? 👋", "Have a dental question? 🦷", "Looking for a treatment?", "Want to book an appointment?", "Can I help you find something?"];

const SUGGESTED_QUESTIONS = [
  "What treatments do you offer?",
  "How much do treatments cost?",
  "I have tooth pain",
  "How can I book an appointment?",
  "Where is the clinic?",
];

const RESPONSES = [
  { match: ["cost", "price", "prices", "implant"], text: "Treatment prices depend on the procedure. Dental implant treatment starts from ₹20,000, and the final cost may vary depending on your dental assessment and treatment plan.", action: "View Treatment Prices", target: "treatments" },
  { match: ["treatment", "offer"], text: "We offer root canal treatment, crowns, fillings, implants, cleaning, braces, aligners and other general dental care.", action: "View Treatments", target: "treatments" },
  { match: ["pain", "ache", "hurts"], text: "Tooth pain can have different causes. It is best to have your tooth assessed by a dentist. You can request an appointment for an evaluation.", action: "Book an Appointment", target: "appointment" },
  { match: ["book", "appointment", "schedule"], text: "You can request an appointment using the Book an Appointment button. The clinic can contact you to confirm the details.", action: "Book an Appointment", target: "appointment" },
  { match: ["where", "location", "located", "clinic", "address"], text: "SPM Dental Care is located in Kumananchavadi, Chennai.", action: "View Location", target: "location" },
] as const;

type ChatMessage = { role: "assistant" | "user"; text: string; action?: string; target?: string };
type AssistantResponse = { text: string; action?: string; target?: string };

function getResponse(question: string): AssistantResponse {
  const normalized = question.toLowerCase();
  return RESPONSES.find((item) => item.match.some((word) => normalized.includes(word))) ?? {
    text: "I'm not able to answer that yet, but I can help you with treatments, prices, location or appointments.",
  };
}

export default function ScrollToothMascot() {
  const { openModal } = useAppointmentModal();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isPressed, setIsPressed] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false);
  const isCycleRunning = useRef(false);
  const cycleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const promptIndexRef = useRef(0);
  const chatOpenRef = useRef(false);
  const promptRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let frameId: number | null = null;
    let lastScrollY = window.scrollY;

    function triggerPeek() {
      if (isCycleRunning.current || chatOpenRef.current) return;

      isCycleRunning.current = true;
      const nextPrompt = PROMPTS[promptIndexRef.current % PROMPTS.length] ?? PROMPTS[0]!;
      promptIndexRef.current += 1;
      promptRef.current = nextPrompt;
      setPrompt(nextPrompt);
      setIsPeeking(true);

      cycleTimer.current = setTimeout(() => {
        setIsPeeking(false);
        setPrompt(null);
        promptRef.current = null;
        isCycleRunning.current = false;
      }, 4000);
    }

    function updateScroll() {
      frameId = null;
      const nextScrollY = window.scrollY;
      if (Math.abs(nextScrollY - lastScrollY) >= 8) triggerPeek();
      lastScrollY = nextScrollY;
    }

    function handleScroll() {
      if (frameId === null) frameId = window.requestAnimationFrame(updateScroll);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      if (cycleTimer.current !== null) clearTimeout(cycleTimer.current);
    };
  }, []);

  useEffect(() => {
    if (isChatOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isChatOpen, messages]);

  function openAssistant() {
    setIsChatOpen(true);
    chatOpenRef.current = true;
    setPrompt(null);
    promptRef.current = null;
    setIsPeeking(false);
    isCycleRunning.current = true;
    if (cycleTimer.current !== null) clearTimeout(cycleTimer.current);
    setIsPressed(true);
    window.setTimeout(() => setIsPressed(false), 180);
    setMessages((current) => current.length ? current : [
      { role: "assistant", text: "Hi! 👋" },
      { role: "assistant", text: "I'm your SPM Dental Assistant. I can help you explore treatments, prices and appointments." },
      { role: "assistant", text: "What would you like to know? 🦷" },
    ]);
  }

  function closeAssistant() {
    setIsChatOpen(false);
    chatOpenRef.current = false;
    setIsPeeking(false);
    setPrompt(null);
    promptRef.current = null;
    isCycleRunning.current = false;
    if (cycleTimer.current !== null) clearTimeout(cycleTimer.current);
  }

  function runAction(target?: string) {
    if (target === "appointment") {
      closeAssistant();
      openModal();
    } else if (target) {
      document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function submitQuestion(question: string) {
    const trimmed = question.trim();
    if (!trimmed) return;
    const response = getResponse(trimmed);
    setMessages((current) => [...current, { role: "user", text: trimmed }, { role: "assistant", text: response.text, action: response.action, target: response.target }]);
    setInput("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitQuestion(input);
  }

  return (
    <>
      {prompt && !isChatOpen ? (
        <button type="button" aria-label="Open dental assistant" onClick={openAssistant} className="pointer-events-auto fixed bottom-[195px] right-3 z-[10000] w-52 rounded-2xl border border-line bg-card px-3 py-2 text-left text-xs font-medium leading-relaxed text-ink shadow-[0_8px_24px_rgba(16,44,69,0.18)] animate-[spm-assistant-pop_240ms_ease-out] sm:bottom-[265px] sm:right-6">
          {prompt}
        </button>
      ) : null}

      {isChatOpen ? (
        <section aria-label="SPM Dental Assistant chat" className="pointer-events-auto fixed bottom-[142px] right-3 z-[10000] flex max-h-[72vh] w-[calc(100vw-48px)] max-w-[calc(100vw-48px)] flex-col overflow-hidden rounded-2xl border border-line bg-card text-left shadow-[0_16px_44px_rgba(16,44,69,0.22)] animate-[spm-assistant-pop_240ms_ease-out] sm:bottom-[90px] sm:right-6 sm:w-[350px] sm:max-w-[350px] sm:max-h-[500px]">
          <header className="flex shrink-0 items-center justify-between gap-3 bg-[#102C45] px-4 py-3 text-white">
            <div className="flex items-center gap-2 text-sm font-semibold"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-base">🦷</span>SPM Dental Assistant</div>
            <button type="button" onClick={closeAssistant} aria-label="Close dental assistant" className="text-xl leading-none text-white/75 hover:text-white">×</button>
          </header>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-4 sm:px-4">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[88%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${message.role === "user" ? "rounded-br-md bg-[#0F9D95] text-white" : "rounded-bl-md bg-canvas-soft text-ink"}`}>
                  <span className="mb-1 block text-[0.625rem] font-semibold uppercase tracking-[0.12em] opacity-55">{message.role === "user" ? "You" : "Assistant"}</span>
                  {message.text}
                  {message.action ? <button type="button" onClick={() => runAction(message.target)} className="mt-2 block rounded-lg border border-[#176B69]/25 bg-white px-2.5 py-1.5 text-left text-[0.6875rem] font-semibold text-blue-900 hover:bg-[#E1F0EF]">{message.action}</button> : null}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="shrink-0 border-t border-line bg-card p-3">
            <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
              {SUGGESTED_QUESTIONS.map((question) => <button key={question} type="button" onClick={() => submitQuestion(question)} className="shrink-0 rounded-full border border-line bg-white px-3 py-1.5 text-[0.6875rem] font-medium text-blue-900 hover:border-[#2A9D9A] hover:bg-[#E1F0EF]">{question}</button>)}
            </div>
            <form onSubmit={handleSubmit} className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-1.5">
              <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask something..." aria-label="Ask the dental assistant" className="min-w-0 flex-1 bg-transparent text-xs text-ink outline-none placeholder:text-ink/45" />
              <button type="submit" aria-label="Send message" className="text-lg leading-none text-[#176B69] hover:text-blue-900">➤</button>
            </form>
          </div>
        </section>
      ) : null}

      <button type="button" aria-label="Open SPM Dental Assistant" onClick={openAssistant} className={`pointer-events-auto fixed bottom-[145px] right-[-16px] z-[10000] block rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/70 sm:bottom-[205px] sm:right-[-18px] ${isPeeking ? "translate-x-[-28px]" : "translate-x-0"} ${isPressed ? "scale-110" : "scale-100"} transition-transform duration-500 ease-out`}>
        <svg viewBox="0 0 64 76" className="h-10 w-9 sm:h-12 sm:w-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g className={isPeeking ? "animate-[spm-tooth-body_700ms_ease-in-out_infinite]" : ""}>
            <path d="M32 4C18.7 4 10 12.3 10 25.1c0 10.6 4.6 16.1 6.6 24.1 1.5 6.1 4 14.2 9 14.2 3.7 0 4.3-6.1 6.4-11.1 2.1 5 2.7 11.1 6.4 11.1 5 0 7.5-8.1 9-14.2 2-8 6.6-13.5 6.6-24.1C54 12.3 45.3 4 32 4Z" fill="#FFFDF8" stroke="#176B69" strokeWidth="2.5" />
            <circle cx="25" cy="28" r="2.4" fill="#102C45" /><circle cx="39" cy="28" r="2.4" fill="#102C45" />
            <path d="M27 36c3 3 7 3 10 0" stroke="#102C45" strokeWidth="2" strokeLinecap="round" /><path d="M28 13c2-2 6-2 8 0" stroke="#C5963A" strokeWidth="2" strokeLinecap="round" />
          </g>
          <g className={isPeeking ? "origin-[11px_43px] animate-[spm-tooth-arm-left_700ms_ease-in-out_infinite]" : ""}>
            <path d="M11 43 3 39" stroke="#176B69" strokeWidth="2.2" strokeLinecap="round" />
          </g>
          <g className={isPeeking ? "origin-[53px_43px] animate-[spm-tooth-arm-right_700ms_ease-in-out_infinite]" : ""}>
            <path d="M53 43 61 39" stroke="#176B69" strokeWidth="2.2" strokeLinecap="round" />
          </g>
          <g className={isPeeking ? "origin-[18px_61px] animate-[spm-tooth-leg-left_700ms_ease-in-out_infinite]" : ""}>
            <path d="M18 61 13 68" stroke="#176B69" strokeWidth="2.2" strokeLinecap="round" />
          </g>
          <g className={isPeeking ? "origin-[46px_61px] animate-[spm-tooth-leg-right_700ms_ease-in-out_infinite]" : ""}>
            <path d="M46 61 51 68" stroke="#176B69" strokeWidth="2.2" strokeLinecap="round" />
          </g>
          <circle cx="50" cy="12" r="3" fill="#C5963A" opacity=".9" />
        </svg>
      </button>
      <style>{`@keyframes spm-assistant-pop { from { opacity: 0; transform: translateY(4px) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } } @keyframes spm-tooth-body { 0%,100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(1.5px) rotate(2deg); } } @keyframes spm-tooth-arm-left { 0%,100% { transform: rotate(18deg); } 50% { transform: rotate(-14deg); } } @keyframes spm-tooth-arm-right { 0%,100% { transform: rotate(-14deg); } 50% { transform: rotate(18deg); } } @keyframes spm-tooth-leg-left { 0%,100% { transform: rotate(22deg); } 50% { transform: rotate(-18deg); } } @keyframes spm-tooth-leg-right { 0%,100% { transform: rotate(-18deg); } 50% { transform: rotate(22deg); } }`}</style>
    </>
  );
}
