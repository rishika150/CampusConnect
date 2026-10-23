/**
 * Build a Google Forms registration URL without inventing prefill IDs.
 * Only accepts the two approved HTTPS Google Forms hosts.
 */
export function buildGoogleFormUrl(event, user) {
  if (!event?.registrationFormUrl) return null;
  try {
    const url = new URL(event.registrationFormUrl);
    if (url.protocol !== "https:") return null;
    const short = url.hostname === "forms.gle";
    const docs = url.hostname === "docs.google.com" && url.pathname.startsWith("/forms/");
    if (!short && !docs) return null;
    if (docs) {
      for (const [key, value] of [
        [event.formNameEntryId, user?.fullName],
        [event.formEmailEntryId, user?.email],
      ]) {
        if (key && /^entry\.[0-9]+$/.test(key) && value) url.searchParams.set(key, value);
      }
    }
    return url.href;
  } catch {
    return null;
  }
}
