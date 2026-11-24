/**
 * Apparitions au défilement : les éléments marqués `data-apparait` montent en fondu quand ils arrivent à l'écran.
 * Rien ne se cache sans navigateur compatible, ni si l'appareil demande moins d'animations (la classe `effets` n'est pas posée).
 * Un `--i` sur l'élément décale son apparition (cascade dans une liste).
 */
export function surveillerApparitions(racine: HTMLElement): () => void {
  if (typeof IntersectionObserver === 'undefined' || typeof window.matchMedia !== 'function'
    || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => undefined;
  document.documentElement.classList.add('effets');
  const io = new IntersectionObserver((entrees) => {
    for (const e of entrees) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('vu');
      io.unobserve(e.target);
    }
  }, { rootMargin: '0px 0px -6% 0px' });
  const suivre = () => racine.querySelectorAll('[data-apparait]:not(.vu)').forEach((el) => io.observe(el));
  suivre();
  // Nouveaux éléments affichés (autre téléphone, onglet…) : suivis à leur tour.
  const mo = new MutationObserver(suivre);
  mo.observe(racine, { childList: true, subtree: true });
  return () => { io.disconnect(); mo.disconnect(); };
}

/** Moins d'animations demandé par l'appareil (ou navigateur de test sans `matchMedia`). */
export const mouvementReduit = () => typeof window.matchMedia !== 'function' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
