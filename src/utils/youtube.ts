/**
 * Extrae el identificador de 11 caracteres de cualquier URL o formato de enlace de YouTube.
 * Soporta enlaces estandar (watch?v=), cortos (youtu.be/), shorts (/shorts/), transmisiones en vivo (/live/)
 * y enlaces con parametros de seguimiento o tiempo (?si=..., &t=...).
 */
export function extractYoutubeId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // Si ya es un ID de 11 caracteres
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Patrones variados de URLs de YouTube
  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;

  const match = trimmed.match(regex);
  if (match && match[1] && match[1].length === 11) {
    return match[1];
  }

  return null;
}
