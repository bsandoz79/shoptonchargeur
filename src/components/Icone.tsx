/** Icônes au trait, décoratives : toujours accompagnées d'un texte. */
const TRACES = {
  eclair: <path d="M13 3 5 13.5h6L10 21l8-10.5h-6z" />,
  loupe: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></>,
  telephone: <><rect x="7" y="2.5" width="10" height="19" rx="2.5" /><path d="M11 18.5h2" /></>,
  prise: <><path d="M9 3v5M15 3v5M6.5 8h11v4a5.5 5.5 0 0 1-11 0zM12 17.5V21" /></>,
  cable: <><path d="M7 3h4v5H7zM13 16h4v5h-4zM9 8v3a3 3 0 0 0 3 3 3 3 0 0 1 3 3" /></>,
  coche: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  externe: <><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></>,
  ordinateur: <><rect x="4" y="5" width="16" height="11" rx="1.5" /><path d="M2.5 19.5h19" /></>,
  haut: <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" />,
  croix: <path d="M6 6l12 12M18 6 6 18" />,
} as const;

export type NomIcone = keyof typeof TRACES;

export function Icone({ nom, taille = 20 }: { nom: NomIcone; taille?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={taille} height={taille} fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {TRACES[nom]}
    </svg>
  );
}
