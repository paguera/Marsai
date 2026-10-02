/**
 * Échappe les caractères HTML spéciaux pour prévenir les injections HTML et XSS
 * dans les e-mails ou les templates dynamiques.
 */
export function escapeHtml(str: string | undefined | null): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
