/**
 * Dessin du haut de l'accueil : un téléphone en charge, branché par son câble à un chargeur, avec un éclair sur l'écran.
 * Couleurs vives, sur le bandeau vert. Décoratif : caché aux lecteurs d'écran.
 */
export function SceneAccueil() {
  return (
    <svg viewBox="0 0 360 280" width="100%" role="presentation" aria-hidden="true" focusable="false">
      {/* Halo et petites étincelles. */}
      <circle cx="190" cy="140" r="118" fill="#ffffff" opacity=".12" />
      <circle cx="190" cy="140" r="84" fill="#ffffff" opacity=".12" />
      <path d="M318 52 l5 12 l12 5 l-12 5 l-5 12 l-5 -12 l-12 -5 l12 -5 z" fill="#ffc21a" />
      <path d="M58 70 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3 z" fill="#ffffff" opacity=".85" />
      <path d="M300 214 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 z" fill="#ffffff" opacity=".7" />

      {/* Câble, du téléphone au chargeur. */}
      <path d="M214 236 C 214 262, 150 262, 120 244 S 84 214, 92 196" fill="none" stroke="#06351f" strokeWidth="9" strokeLinecap="round" />
      <path d="M214 236 C 214 262, 150 262, 120 244 S 84 214, 92 196" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />

      {/* Chargeur. */}
      <g strokeLinejoin="round">
        <rect x="74" y="200" width="7" height="16" rx="3.5" transform="rotate(180 77.5 208)" fill="#cfd5d2" stroke="#06351f" strokeWidth="1.5" />
        <rect x="102" y="200" width="7" height="16" rx="3.5" transform="rotate(180 105.5 208)" fill="#cfd5d2" stroke="#06351f" strokeWidth="1.5" />
        <path d="M118 122 l22 -12 v72 l-22 12 z" fill="#d9e6df" stroke="#06351f" strokeWidth="2" />
        <path d="M58 122 l22 -12 h60 l-22 12 z" fill="#ffffff" stroke="#06351f" strokeWidth="2" />
        <rect x="58" y="122" width="60" height="72" rx="9" fill="#ffffff" stroke="#06351f" strokeWidth="2" />
        <rect x="76" y="140" width="24" height="8" rx="4" fill="#06351f" />
        <path d="M91 156 l-8 14 h6 l-2 10 l10 -15 h-6 l3 -9 z" fill="#19c37d" />
        <rect x="80" y="190" width="24" height="10" rx="4" fill="#ffffff" stroke="#06351f" strokeWidth="2" />
      </g>

      {/* Téléphone. */}
      <g strokeLinejoin="round">
        <rect x="168" y="28" width="96" height="204" rx="18" fill="#06351f" />
        <rect x="175" y="36" width="82" height="188" rx="13" fill="#e9fff4" />
        <rect x="203" y="42" width="26" height="7" rx="3.5" fill="#06351f" />
        {/* Batterie qui se remplit. */}
        <rect x="190" y="150" width="52" height="24" rx="6" fill="#ffffff" stroke="#06351f" strokeWidth="2.5" />
        <rect x="242" y="157" width="5" height="10" rx="2" fill="#06351f" />
        <rect x="194" y="154" width="32" height="16" rx="3.5" fill="#19c37d" />
        {/* Éclair sur l'écran. */}
        <path d="M222 70 L196 112 H214 L208 140 L236 98 H218 Z" fill="#ffc21a" stroke="#06351f" strokeWidth="2.5" />
        <rect x="196" y="190" width="40" height="6" rx="3" fill="#06351f" opacity=".15" />
        <rect x="204" y="202" width="24" height="6" rx="3" fill="#06351f" opacity=".1" />
        <rect x="206" y="226" width="20" height="10" rx="3" fill="#06351f" />
      </g>
    </svg>
  );
}
