/**
 * Logo de Shop ton chargeur : un éclair jaune dans un carré vert arrondi, puis le nom, « chargeur » en vert.
 * Dessiné en code (net à toutes les tailles). La même marque sert aux icônes du site (public/*.png).
 */
export function MarqueLogo({ taille = 36 }: { taille?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={taille} height={taille} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="logo-fond" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1fd087" />
          <stop offset="1" stopColor="#00875a" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="46" height="46" rx="13" fill="url(#logo-fond)" />
      <path d="M27.5 6.5 L12.5 27.5 H22.5 L19.5 41.5 L35.5 19.5 H25.5 Z" fill="#ffc21a" stroke="#06351f" strokeWidth="2.4" strokeLinejoin="round" />
    </svg>
  );
}

/** Logo complet de l'en-tête : la marque et le nom du site. */
export function Logo() {
  return (
    <>
      <MarqueLogo />
      <span>Shop ton <span style={{ color: 'var(--c-accent-texte)' }}>chargeur</span></span>
    </>
  );
}
