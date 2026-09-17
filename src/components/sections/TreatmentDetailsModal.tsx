"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import Button from "@/components/ui/Button";
import { useAppointmentModal } from "@/components/appointment/AppointmentModalContext";

export interface TreatmentDetails {
  id: string;
  name: string;
  price: number | null;
  description: string;
}

interface TreatmentDetailsModalProps {
  treatment: TreatmentDetails | null;
  onClose: () => void;
}

interface TreatmentVisualContent {
  before: { src: string; alt: string };
  after: { src: string; alt: string };
  about: string;
  points: string[];
}

type TreatmentImagePair = Pick<TreatmentVisualContent, "before" | "after">;

const DEFAULT_VISUAL_CONTENT: TreatmentVisualContent = {
  before: {
    src: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=900&q=85",
    alt: "Illustrative dental examination before treatment",
  },
  after: {
    src: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=900&q=85",
    alt: "Illustrative healthy smile after treatment",
  },
  about: "This treatment is planned around your dental needs and helps support a healthier, more comfortable smile.",
  points: [
    "Your dentist will assess your teeth and discuss the suitable approach.",
    "The treatment plan is tailored to your comfort and oral health.",
    "Follow-up guidance helps protect your result over time.",
  ],
};

const VISUAL_CONTENT: Record<string, TreatmentVisualContent> = {
  "root-canal": {
    before: {
      src: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=900&q=85",
      alt: "Illustrative tooth examination before root canal treatment",
    },
    after: {
      src: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=900&q=85",
      alt: "Illustrative restored smile after root canal treatment",
    },
    about: "Root canal treatment removes infected or inflamed tissue from inside the tooth and helps preserve the natural tooth.",
    points: [
      "Helps relieve pain caused by infection or inflammation.",
      "Protects the natural tooth from further damage.",
      "A final restoration helps seal and strengthen the tooth.",
    ],
  },
  "dental-crowns": {
    before: {
      src: "https://images.unsplash.com/photo-1606265752439-1f18756aa2d0?auto=format&fit=crop&w=900&q=85",
      alt: "Illustrative damaged tooth before a dental crown",
    },
    after: {
      src: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=900&q=85",
      alt: "Illustrative restored smile with a dental crown",
    },
    about: "A dental crown is a custom-made cap placed over a damaged or weakened tooth. It helps restore the tooth's shape, strength and appearance.",
    points: [
      "Covers and protects a weakened tooth.",
      "Restores shape, function and appearance.",
      "Designed to fit comfortably with your bite.",
    ],
  },
  "dental-fillings": {
    before: {
      src: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=900&q=85",
      alt: "Illustrative tooth with cavity before a filling",
    },
    after: {
      src: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=900&q=85",
      alt: "Illustrative restored tooth after a filling",
    },
    about: "Dental fillings are used to repair teeth affected by cavities or minor decay. The damaged portion is removed and the tooth is restored with a suitable filling material.",
    points: [
      "Removes the decayed portion of the tooth.",
      "Restores the tooth's shape and everyday function.",
      "Early treatment can help prevent decay from spreading.",
    ],
  },
  "dental-implants": {
    before: {
      src: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=900&q=85",
      alt: "Illustrative missing tooth before a dental implant",
    },
    after: {
      src: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=900&q=85",
      alt: "Illustrative replacement tooth after a dental implant",
    },
    about: "Dental implants are used to replace missing teeth. An implant supports a replacement tooth and helps restore chewing function and appearance.",
    points: [
      "Replaces a missing tooth with a stable restoration.",
      "Supports comfortable chewing and speaking.",
      "Treatment is planned after a detailed dental assessment.",
    ],
  },
  "teeth-cleaning": {
    before: {
      src: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=900&q=85",
      alt: "Illustrative plaque and staining before teeth cleaning",
    },
    after: {
      src: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=900&q=85",
      alt: "Illustrative clean smile after teeth cleaning",
    },
    about: "Professional teeth cleaning removes plaque and hardened deposits that regular brushing may miss, helping keep your gums and teeth healthy.",
    points: [
      "Helps remove plaque and surface staining.",
      "Supports healthier gums and fresher breath.",
      "Regular visits help maintain your oral hygiene routine.",
    ],
  },
  "mouth-ulcers": {
    before: {
      src: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=900&q=85",
      alt: "Illustrative mouth discomfort before treatment",
    },
    after: {
      src: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=900&q=85",
      alt: "Illustrative comfortable oral health after treatment",
    },
    about: "Mouth ulcers can have different causes. A dental assessment helps identify concerns and guide suitable care when an ulcer is persistent or troublesome.",
    points: [
      "Persistent or recurring ulcers should be assessed.",
      "Your dentist can discuss comfort and care measures.",
      "Early advice can help identify possible causes.",
    ],
  },
  "gum-treatment": {
    before: {
      src: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=900&q=85",
      alt: "Illustrative gum concerns before treatment",
    },
    after: {
      src: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=900&q=85",
      alt: "Illustrative healthy gums after treatment",
    },
    about: "Gum treatment focuses on reducing irritation and helping keep the gums and supporting tissues healthy.",
    points: [
      "Helps address bleeding, swelling or tenderness.",
      "Includes guidance for effective daily cleaning.",
      "Regular reviews help monitor gum health.",
    ],
  },
  "laser-dentistry": {
    before: {
      src: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=900&q=85",
      alt: "Illustrative dental concern before laser dentistry",
    },
    after: {
      src: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=900&q=85",
      alt: "Illustrative oral health after laser dentistry",
    },
    about: "Laser dentistry uses focused dental technology as part of selected treatments, with the approach chosen according to your needs.",
    points: [
      "May support precise treatment in suitable cases.",
      "Your dentist will explain whether it is appropriate for you.",
      "Treatment remains tailored to your comfort and diagnosis.",
    ],
  },
  "tooth-extractions": {
    before: {
      src: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=900&q=85",
      alt: "Illustrative tooth problem before extraction",
    },
    after: {
      src: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=900&q=85",
      alt: "Illustrative comfortable oral health after extraction",
    },
    about: "A tooth extraction removes a tooth that cannot be safely restored or is causing a dental problem. Your dentist will discuss next steps for healing and replacement where needed.",
    points: [
      "The need for removal is assessed carefully first.",
      "Aftercare guidance supports comfortable healing.",
      "Replacement options can be discussed when appropriate.",
    ],
  },
  "wisdom-teeth": {
    before: {
      src: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=900&q=85",
      alt: "Illustrative wisdom tooth concern before treatment",
    },
    after: {
      src: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=900&q=85",
      alt: "Illustrative comfortable oral health after wisdom tooth care",
    },
    about: "Wisdom tooth care helps manage teeth that are painful, difficult to clean or affecting nearby teeth.",
    points: [
      "An examination identifies the position and condition of the tooth.",
      "Care is planned around your symptoms and dental health.",
      "You receive clear aftercare guidance after treatment.",
    ],
  },
  dentures: {
    before: {
      src: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=900&q=85",
      alt: "Illustrative missing teeth before dentures",
    },
    after: {
      src: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=900&q=85",
      alt: "Illustrative restored smile with dentures",
    },
    about: "Dentures are removable replacements for missing teeth that can help restore appearance, speech and everyday chewing.",
    points: [
      "Designed to replace several missing teeth.",
      "Fit and comfort are checked during the process.",
      "Care instructions help keep the appliance and mouth healthy.",
    ],
  },
  "dental-braces": {
    before: {
      src: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=900&q=85",
      alt: "Illustrative tooth alignment before braces",
    },
    after: {
      src: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=900&q=85",
      alt: "Illustrative straighter smile after braces",
    },
    about: "Dental braces use gentle, planned pressure over time to improve tooth alignment and bite.",
    points: [
      "Treatment is planned around your alignment needs.",
      "Regular reviews track progress and adjust the appliance.",
      "Good cleaning habits are important throughout treatment.",
    ],
  },
  aligners: {
    before: {
      src: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=900&q=85",
      alt: "Illustrative tooth alignment before clear aligners",
    },
    after: {
      src: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=900&q=85",
      alt: "Illustrative straighter smile after clear aligners",
    },
    about: "Clear aligners are removable trays designed to guide teeth toward a healthier, more even alignment.",
    points: [
      "The trays are made for your individual treatment plan.",
      "They can be removed for meals and daily cleaning.",
      "Progress depends on wearing them as advised.",
    ],
  },
  "kids-dentistry": {
    before: {
      src: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=900&q=85",
      alt: "Illustrative child dental concern before care",
    },
    after: {
      src: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=900&q=85",
      alt: "Illustrative healthy child smile after care",
    },
    about: "Kids dentistry supports healthy teeth and positive dental habits through age-appropriate care.",
    points: [
      "Visits help children build confidence with dental care.",
      "Advice supports healthy brushing and eating habits.",
      "Treatment is explained in a child-friendly way.",
    ],
  },
};

const TREATMENT_IMAGE_PAIRS: Record<string, TreatmentImagePair> = {
  "root canal treatment": {
    before: { src: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=900&q=85", alt: "Illustrative deep decay before root canal treatment" },
    after: { src: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=900&q=85", alt: "Illustrative restored tooth after root canal treatment" },
  },
  "dental crowns": {
    before: { src: "https://images.unsplash.com/photo-1606265752439-1f18756aa2d0?auto=format&fit=crop&w=900&q=85", alt: "Illustrative damaged tooth before a dental crown" },
    after: { src: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=900&q=85", alt: "Illustrative tooth restored with a dental crown" },
  },
  "dental fillings": {
    before: { src: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=900&q=85", alt: "Illustrative visible cavity before a dental filling" },
    after: { src: "https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=900&q=85", alt: "Illustrative tooth restored with a dental filling" },
  },
  "dental implants": {
    before: { src: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=900&q=85", alt: "Illustrative missing tooth before a dental implant" },
    after: { src: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=85", alt: "Illustrative replacement tooth restored with an implant and crown" },
  },
  "teeth cleaning": {
    before: { src: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=900&q=85", alt: "Illustrative plaque and staining before teeth cleaning" },
    after: { src: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=900&q=85", alt: "Illustrative clean smile after teeth cleaning" },
  },
  "mouth ulcers": {
    before: { src: "https://images.unsplash.com/photo-1516841273335-e39b37888115?auto=format&fit=crop&w=900&q=85", alt: "Illustrative oral discomfort before mouth ulcer care" },
    after: { src: "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=900&q=85", alt: "Illustrative comfortable oral health after mouth ulcer care" },
  },
  "advanced gum treatment": {
    before: { src: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&w=900&q=85", alt: "Illustrative gum concerns before gum treatment" },
    after: { src: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=85", alt: "Illustrative healthier gums after gum treatment" },
  },
  "laser dentistry": {
    before: { src: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=900&q=85", alt: "Illustrative dental concern before laser dentistry" },
    after: { src: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=900&q=85", alt: "Illustrative oral health after laser dentistry" },
  },
  "tooth extractions": {
    before: { src: "https://images.unsplash.com/photo-1606265752439-1f18756aa2d0?auto=format&fit=crop&w=900&q=85", alt: "Illustrative damaged tooth before extraction" },
    after: { src: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=900&q=85", alt: "Illustrative healed oral area after extraction" },
  },
  "wisdom teeth extraction": {
    before: { src: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=900&q=85", alt: "Illustrative wisdom tooth concern before treatment" },
    after: { src: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=900&q=85", alt: "Illustrative comfortable oral health after wisdom tooth care" },
  },
  dentures: {
    before: { src: "https://images.unsplash.com/photo-1516841273335-e39b37888115?auto=format&fit=crop&w=900&q=85", alt: "Illustrative missing teeth before dentures" },
    after: { src: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=85", alt: "Illustrative restored smile with dentures" },
  },
  "dental braces": {
    before: { src: "https://images.unsplash.com/photo-1606265752439-1f18756aa2d0?auto=format&fit=crop&w=900&q=85", alt: "Illustrative misaligned teeth before braces" },
    after: { src: "https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=900&q=85", alt: "Illustrative straighter smile after braces" },
  },
  aligners: {
    before: { src: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=900&q=85", alt: "Illustrative tooth alignment before clear aligners" },
    after: { src: "https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&w=900&q=85", alt: "Illustrative straighter smile after clear aligners" },
  },
  "kids dentistry": {
    before: { src: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=900&q=85", alt: "Illustrative child dental concern before care" },
    after: { src: "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=900&q=85", alt: "Illustrative healthy child smile after care" },
  },
};

function normalizeTreatmentName(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ");
}

function dentalIllustration(
  treatment: string,
  stage: "before" | "after",
  visual: string,
  alt: string,
) {
  const isBefore = stage === "before";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 675"><rect width="900" height="675" rx="28" fill="#e5f0ef"/><path d="M0 505c170-90 300-82 450-10 150 72 280 80 450-5v185H0Z" fill="#c5dcdc"/><g transform="translate(225 95)"><path d="M225 35c-105 0-168 66-160 166 7 91 46 124 61 198 10 50 38 72 63 32l36-86 36 86c25 40 53 18 63-32 15-74 54-107 61-198 8-100-55-166-160-166Z" fill="#fffdf8" stroke="#176b69" stroke-width="9"/><path d="M116 126c33-33 69-46 109-46s76 13 109 46" fill="none" stroke="#c4d9dc" stroke-width="8" stroke-linecap="round"/>${visual}</g><text x="450" y="590" text-anchor="middle" font-family="Arial,sans-serif" font-size="27" font-weight="700" fill="#102c45">${treatment} · ${isBefore ? "Before" : "After"}</text></svg>`;

  return {
    src: `data:image/svg+xml,${encodeURIComponent(svg)}`,
    alt,
  };
}

const DENTAL_IMAGE_PAIRS: Record<string, TreatmentImagePair> = {
  "root canal treatment": {
    before: dentalIllustration("Root canal treatment", "before", '<path d="M225 160v245" stroke="#c94646" stroke-width="20" stroke-dasharray="18 18"/><circle cx="225" cy="160" r="34" fill="#d87965" opacity=".8"/>', "Illustrative infected tooth before root canal treatment"),
    after: dentalIllustration("Root canal treatment", "after", '<path d="M225 160v245" stroke="#176b69" stroke-width="16"/><path d="M205 160h40" stroke="#b88935" stroke-width="10"/>', "Illustrative restored tooth after root canal treatment"),
  },
  "dental crowns": {
    before: dentalIllustration("Dental crowns", "before", '<path d="m162 190 45 24 36-48 36 48 44-24-17 93H179Z" fill="#d87965" stroke="#a9534b" stroke-width="8"/>', "Illustrative damaged tooth before a dental crown"),
    after: dentalIllustration("Dental crowns", "after", '<path d="m157 174 50 25 36-43 36 43 50-25-18 105H175Z" fill="#e8c56d" stroke="#b88935" stroke-width="8"/><path d="M180 279h120" stroke="#fff7d7" stroke-width="9"/>', "Illustrative tooth restored with a dental crown"),
  },
  "dental fillings": {
    before: dentalIllustration("Dental fillings", "before", '<circle cx="278" cy="220" r="38" fill="#70463d"/><circle cx="278" cy="220" r="19" fill="#3d2825"/>', "Illustrative cavity before a dental filling"),
    after: dentalIllustration("Dental fillings", "after", '<circle cx="278" cy="220" r="38" fill="#d9c59c" stroke="#b88935" stroke-width="7"/><circle cx="278" cy="220" r="17" fill="#f5e9c8"/>', "Illustrative tooth restored with a dental filling"),
  },
  "dental implants": {
    before: dentalIllustration("Dental implants", "before", '<path d="M180 275h90" stroke="#c5dcdc" stroke-width="20" stroke-linecap="round"/><path d="M205 275v65M245 275v65" stroke="#b8caca" stroke-width="10" stroke-dasharray="9 10"/>', "Illustrative missing tooth gap before a dental implant"),
    after: dentalIllustration("Dental implants", "after", '<path d="M225 205v125" stroke="#b88935" stroke-width="14" stroke-dasharray="8 8"/><path d="m180 174 45 25 45-25-15 98h-60Z" fill="#fffdf8" stroke="#b88935" stroke-width="8"/>', "Illustrative implant-supported crown after treatment"),
  },
  "teeth cleaning": {
    before: dentalIllustration("Teeth cleaning", "before", '<path d="M120 290c55 30 110 30 165 0" stroke="#c87d52" stroke-width="25" stroke-linecap="round"/><circle cx="150" cy="284" r="11" fill="#9b5e44"/><circle cx="210" cy="298" r="10" fill="#9b5e44"/>', "Illustrative plaque buildup before teeth cleaning"),
    after: dentalIllustration("Teeth cleaning", "after", '<path d="M120 290c55 22 110 22 165 0" stroke="#fff" stroke-width="13" stroke-linecap="round"/><path d="m230 176 20 42 42 20-42 20-20 42-20-42-42-20 42-20Z" fill="#b88935" opacity=".8"/>', "Illustrative clean teeth after plaque removal"),
  },
  "mouth ulcers": {
    before: dentalIllustration("Mouth ulcers", "before", '<ellipse cx="250" cy="260" rx="42" ry="27" fill="#d87965" stroke="#a9534b" stroke-width="7"/><circle cx="250" cy="260" r="12" fill="#fff1dc"/>', "Illustrative mouth ulcer before care"),
    after: dentalIllustration("Mouth ulcers", "after", '<ellipse cx="250" cy="260" rx="42" ry="27" fill="#e5f0ef" stroke="#176b69" stroke-width="7"/><path d="m233 260 12 12 25-28" stroke="#176b69" stroke-width="9" fill="none"/>', "Illustrative comfortable oral area after ulcer care"),
  },
  "advanced gum treatment": {
    before: dentalIllustration("Gum treatment", "before", '<path d="M95 177c80 67 180 67 260 0v72c-80 45-180 45-260 0Z" fill="#d87965" opacity=".85"/>', "Illustrative inflamed gums before gum treatment"),
    after: dentalIllustration("Gum treatment", "after", '<path d="M95 177c80 50 180 50 260 0v50c-80 32-180 32-260 0Z" fill="#8ccfc7" opacity=".8"/><path d="M125 245h200" stroke="#176b69" stroke-width="8" stroke-linecap="round"/>', "Illustrative healthier gums after gum treatment"),
  },
  "laser dentistry": {
    before: dentalIllustration("Laser dentistry", "before", '<circle cx="255" cy="230" r="48" fill="#d87965" opacity=".75"/><path d="M90 130 215 215" stroke="#b88935" stroke-width="7" stroke-dasharray="14 12"/>', "Illustrative dental area before laser dentistry"),
    after: dentalIllustration("Laser dentistry", "after", '<circle cx="255" cy="230" r="48" fill="#e5f0ef" stroke="#176b69" stroke-width="8"/><path d="M90 130 215 215" stroke="#b88935" stroke-width="7"/><path d="m80 112 12 18 20 5-18 12-4 20-12-17-20-5 18-12Z" fill="#b88935"/>', "Illustrative treated dental area after laser dentistry"),
  },
  "tooth extractions": {
    before: dentalIllustration("Tooth extractions", "before", '<path d="M180 175v115M270 175v115" stroke="#c94646" stroke-width="12"/><path d="M145 290c40 28 120 28 160 0" stroke="#d87965" stroke-width="22"/>', "Illustrative tooth problem before extraction"),
    after: dentalIllustration("Tooth extractions", "after", '<path d="M145 290c40 28 120 28 160 0" stroke="#8ccfc7" stroke-width="16"/><path d="M190 285h70" stroke="#176b69" stroke-width="8" stroke-linecap="round"/>', "Illustrative healed area after tooth extraction"),
  },
  "wisdom teeth extraction": {
    before: dentalIllustration("Wisdom teeth", "before", '<path d="M305 170c48 30 55 83 24 130" stroke="#d87965" stroke-width="23" stroke-linecap="round"/><path d="M306 180 350 225" stroke="#c94646" stroke-width="9"/>', "Illustrative wisdom tooth concern before treatment"),
    after: dentalIllustration("Wisdom teeth", "after", '<path d="M305 170c34 22 39 58 22 90" stroke="#8ccfc7" stroke-width="16" stroke-linecap="round"/><path d="M285 285h55" stroke="#176b69" stroke-width="8" stroke-linecap="round"/>', "Illustrative comfortable area after wisdom tooth care"),
  },
  dentures: {
    before: dentalIllustration("Dentures", "before", '<path d="M110 260c42-35 188-35 230 0" stroke="#c5dcdc" stroke-width="22" stroke-dasharray="17 16"/><path d="M130 285c55 35 135 35 190 0" stroke="#d87965" stroke-width="16"/>', "Illustrative missing teeth before dentures"),
    after: dentalIllustration("Dentures", "after", '<path d="M110 260c42-35 188-35 230 0" stroke="#fffdf8" stroke-width="22"/><path d="M130 285c55 35 135 35 190 0" stroke="#b88935" stroke-width="9"/>', "Illustrative restored smile with dentures"),
  },
  "dental braces": {
    before: dentalIllustration("Dental braces", "before", '<path d="M140 240c35-55 75 55 110 0s75 55 110 0" fill="none" stroke="#d87965" stroke-width="17"/>', "Illustrative crowded teeth before braces"),
    after: dentalIllustration("Dental braces", "after", '<path d="M140 240h220" stroke="#8ccfc7" stroke-width="13"/><path d="M165 210v60M210 210v60M255 210v60M300 210v60" stroke="#176b69" stroke-width="7"/><circle cx="165" cy="240" r="12" fill="#b88935"/><circle cx="210" cy="240" r="12" fill="#b88935"/><circle cx="255" cy="240" r="12" fill="#b88935"/><circle cx="300" cy="240" r="12" fill="#b88935"/>', "Illustrative aligned teeth with braces"),
  },
  aligners: {
    before: dentalIllustration("Clear aligners", "before", '<path d="M140 240c35-55 75 55 110 0s75 55 110 0" fill="none" stroke="#d87965" stroke-width="17"/>', "Illustrative misaligned teeth before clear aligners"),
    after: dentalIllustration("Clear aligners", "after", '<path d="M140 240c35-20 75 20 110 0s75 20 110 0" fill="none" stroke="#8ccfc7" stroke-width="18"/><path d="M135 222c75-35 150 35 230 0" fill="none" stroke="#176b69" stroke-width="5" opacity=".8"/>', "Illustrative aligned teeth after clear aligner treatment"),
  },
  "kids dentistry": {
    before: dentalIllustration("Kids dentistry", "before", '<circle cx="185" cy="225" r="25" fill="#d87965"/><circle cx="265" cy="225" r="25" fill="#d87965"/><path d="M190 280c25 20 55 20 80 0" stroke="#c94646" stroke-width="9"/>', "Illustrative child dental concern before care"),
    after: dentalIllustration("Kids dentistry", "after", '<circle cx="185" cy="225" r="25" fill="#fffdf8" stroke="#8ccfc7" stroke-width="7"/><circle cx="265" cy="225" r="25" fill="#fffdf8" stroke="#8ccfc7" stroke-width="7"/><path d="M190 280c25 20 55 20 80 0" stroke="#176b69" stroke-width="9"/>', "Illustrative healthy child smile after care"),
  },
  "teeth whitening": {
    before: dentalIllustration("Teeth whitening", "before", '<path d="M125 240c60-25 140-25 200 0" stroke="#c87d52" stroke-width="26" stroke-linecap="round"/><circle cx="170" cy="235" r="10" fill="#9b5e44"/><circle cx="270" cy="235" r="10" fill="#9b5e44"/>', "Illustrative stained teeth before whitening"),
    after: dentalIllustration("Teeth whitening", "after", '<path d="M125 240c60-25 140-25 200 0" stroke="#fff" stroke-width="25" stroke-linecap="round"/><path d="m260 160 14 28 28 14-28 14-14 28-14-28-28-14 28-14Z" fill="#b88935"/>', "Illustrative brighter teeth after whitening"),
  },
};

function getVisualContent(treatment: TreatmentDetails) {
  const normalizedName = normalizeTreatmentName(treatment.name);
  const aliases: Record<string, string> = {
    braces: "dental braces",
    "dental crown": "dental crowns",
    "dental filling": "dental fillings",
    "dental implant": "dental implants",
  };
  const imagePair = DENTAL_IMAGE_PAIRS[aliases[normalizedName] ?? normalizedName];
  const content = VISUAL_CONTENT[treatment.id] ?? DEFAULT_VISUAL_CONTENT;

  return imagePair
    ? { ...content, before: imagePair.before, after: imagePair.after }
    : content;
}

export default function TreatmentDetailsModal({
  treatment,
  onClose,
}: TreatmentDetailsModalProps) {
  const { openModal } = useAppointmentModal();

  useEffect(() => {
    if (!treatment) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, treatment]);

  if (!treatment || typeof document === "undefined") return null;

  const visualContent = getVisualContent(treatment);
  const price = treatment.price === null ? null : new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(treatment.price);

  return createPortal(
    (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#102C45]/60 p-3 backdrop-blur-sm sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <style>{`@keyframes spm-modal-in { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }`}</style>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="treatment-details-heading"
        className="relative flex max-h-[90vh] w-full max-w-[880px] flex-col overflow-hidden rounded-[1.25rem] border border-line bg-card shadow-[0_24px_80px_rgba(16,44,69,0.28)] animate-[spm-modal-in_280ms_ease-out] sm:max-h-[85vh]"
      >
        <div className="relative flex shrink-0 items-start border-b border-line bg-card px-6 pb-5 pt-6 sm:px-7 sm:pb-5 sm:pt-6">
          <div className="pr-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">Treatment details</p>
            <h2 id="treatment-details-heading" className="mt-2 font-display text-2xl text-blue-900 sm:text-3xl">
              {treatment.name}
            </h2>
            {price ? <p className="mt-2 text-sm font-semibold text-blue-700">{price}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close treatment details"
            className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-canvas-soft text-xl leading-none text-blue-900 transition-colors hover:border-blue-700 hover:bg-[#DCEAEA] hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 sm:right-6 sm:top-5"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5 pb-7 sm:px-7 sm:py-6 sm:pb-8">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4">
            <IllustrativeImage label="Before" image={visualContent.before} />
            <span aria-hidden="true" className="hidden text-2xl text-gold-600 sm:block">→</span>
            <IllustrativeImage label="After" image={visualContent.after} />
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h3 className="font-display text-xl text-blue-900">About this treatment</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/75 sm:text-base">{visualContent.about}</p>
            </div>
            <div>
              <h3 className="font-display text-xl text-blue-900">What to expect</h3>
              <ul className="mt-2 space-y-2 text-sm leading-relaxed text-ink/75 sm:text-base">
                {visualContent.points.map((point) => <li key={point} className="flex gap-2"><span className="text-gold-600">•</span><span>{point}</span></li>)}
              </ul>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Button
              type="button"
              onClick={() => {
                onClose();
                openModal();
              }}
              variant="primary"
              className="!bg-[#0F9D95] !text-white hover:!bg-[#087F7A]"
            >
              Book an Appointment
            </Button>
          </div>
        </div>
      </div>
    </div>
    ),
    document.body,
  );
}

function IllustrativeImage({
  label,
  image,
}: {
  label: string;
  image: { src: string; alt: string };
}) {
  return (
    <figure className="min-w-0">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#DCEAEA]">
        <img src={image.src} alt={image.alt} loading="lazy" className="h-full w-full object-cover" />
        <span className="absolute left-3 top-3 rounded-full bg-[#102C45]/75 px-3 py-1 text-xs font-semibold text-white">{label}</span>
      </div>
      <figcaption className="mt-2 text-center text-xs text-ink/55">Illustrative example</figcaption>
    </figure>
  );
}
