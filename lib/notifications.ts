export async function sendBookingConfirmationSms(phone: string | null, message: string) {
  // Stub — wire up to a JazzCash/Easypaisa-compatible SMS gateway (e.g. Twilio,
  // or a local Pakistani SMS API) once one is chosen for production.
  console.info(`[SMS stub] to ${phone ?? 'unknown number'}: ${message}`);
}
