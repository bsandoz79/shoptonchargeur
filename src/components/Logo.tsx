/**
 * Logo de Shop ton chargeur : un éclair blanc dans un carré vert, à plat, puis le nom.
 * Dessiné en code (net à toutes les tailles). La même marque sert aux icônes du site (public/*.png).
 */
export function MarqueLogo({ taille = 30 }: { taille?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={taille} height={taille} aria-hidden="true" focusable="false">
      <rect width="48" height="48" rx="11" fill="#0a7a4b" />
      <path d="M27 8 L13 27 H22.5 L20 40 L35 20 H25.5 Z" fill="#ffffff" strokeLinejoin="round" />
    </svg>
  );
}

/** Logo complet de l'en-tête : la marque et le nom du site. */
export function Logo() {
  return (
    <>
      <MarqueLogo />
      <span>Shop ton chargeur</span>
    </>
  );
}
