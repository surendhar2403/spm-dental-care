/**
 * Normalizes a loosely-formatted Indian mobile number down to its bare
 * 10-digit form (e.g. "+91 88385 24738", "091-88385-24738" -> "8838524738").
 * Returns null if it doesn't reduce to a plausible 10-digit number.
 */
export function normalizeIndianMobile(phone: string): string | null {
  const digitsOnly = phone.replace(/\D/g, "");

  let tenDigits = digitsOnly;
  if (tenDigits.length === 12 && tenDigits.startsWith("91")) {
    tenDigits = tenDigits.slice(2);
  } else if (tenDigits.length === 11 && tenDigits.startsWith("0")) {
    tenDigits = tenDigits.slice(1);
  }

  return tenDigits.length === 10 ? tenDigits : null;
}

/**
 * Validates that a string is a plausible Indian mobile number: 10 digits,
 * starting with 6-9, once country code / leading zero / spacing / dashes
 * are stripped away.
 */
export function isValidIndianMobile(phone: string): boolean {
  const tenDigits = normalizeIndianMobile(phone);
  return tenDigits !== null && /^[6-9]\d{9}$/.test(tenDigits);
}

/**
 * Builds a wa.me link that opens WhatsApp with a prefilled message.
 * `phone` should be a plain Indian mobile number (e.g. "8838524738");
 * it's normalized to E.164 with the +91 country code.
 */
export function buildWhatsAppUrl(phone: string, message?: string): string {
  const digitsOnly = phone.replace(/\D/g, "");
  const withCountryCode = digitsOnly.startsWith("91")
    ? digitsOnly
    : `91${digitsOnly}`;

  const base = `https://wa.me/${withCountryCode}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/**
 * Builds a tel: link normalized to the +91 E.164 form (e.g.
 * "tel:+918838524738"), regardless of how the source number is formatted.
 */
export function buildTelUrl(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, "");
  const withCountryCode = digitsOnly.startsWith("91")
    ? digitsOnly
    : `91${digitsOnly}`;

  return `tel:+${withCountryCode}`;
}

/**
 * Opens WhatsApp Web (via the standard wa.me click-to-chat link — NOT the
 * WhatsApp Cloud API, no token/Meta developer account involved) in a new
 * tab, with the phone number and message pre-filled. The admin still has to
 * press Send inside WhatsApp themselves; nothing is sent automatically.
 *
 * Returns `false` without opening anything if the phone number doesn't
 * normalize to a plausible Indian mobile number — callers should show a
 * friendly "couldn't open WhatsApp for this number" message in that case
 * and must NOT treat it as an appointment failure (the appointment's
 * confirmed status is saved separately and stays confirmed either way).
 */
export function openWhatsAppConfirmation(phone: string, message: string): boolean {
  if (!isValidIndianMobile(phone)) return false;
  if (typeof window !== "undefined") {
    window.open(buildWhatsAppUrl(phone, message), "_blank", "noopener,noreferrer");
  }
  return true;
}
