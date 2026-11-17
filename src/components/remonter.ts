/** Remonte en haut de la page (en douceur, sauf si l'appareil demande moins d'animations). */
export function remonter() {
  const doux = !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo?.({ top: 0, behavior: doux ? 'smooth' : 'auto' });
}
