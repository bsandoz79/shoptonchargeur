import type { Forme, Teinte } from '../moteur/types';

/**
 * Dessin du produit, à la place d'une photo (les photos des marchands ne peuvent pas être reprises) : même cadrage pour
 * tous, vue de trois quarts, aplats, petit éclair vert sur les blocs secteur. Décoratif : le nom du produit est toujours écrit à côté.
 */
const TEINTES: Record<Teinte, { face: string; cote: string; dessus: string; trait: string; port: string }> = {
  blanc: { face: '#f7f8f6', cote: '#e3e6e1', dessus: '#ffffff', trait: '#b9bfb7', port: '#3a3f3c' },
  noir: { face: '#2f3432', cote: '#1f2321', dessus: '#3b413e', trait: '#151816', port: '#0b0d0c' },
  gris: { face: '#c9cdd0', cote: '#a9aeb2', dessus: '#d8dbdd', trait: '#8b9195', port: '#2d3134' },
};

function Boite({ x, y, l, h, p, t, ports, broches = true }: { x: number; y: number; l: number; h: number; p: number; t: (typeof TEINTES)[Teinte]; ports: number; broches?: boolean }) {
  // Pavé : face avant (l × h), profondeur p vers la droite et le haut.
  const d = p * 0.55;
  return (
    <g strokeLinejoin="round">
      {broches && (
        <g fill="#b7bcb9" stroke="#8d938f" strokeWidth="1">
          <rect x={x + l * 0.28} y={y + h - 2} width="7" height="16" rx="3.5" />
          <rect x={x + l * 0.62} y={y + h - 2} width="7" height="16" rx="3.5" />
        </g>
      )}
      <path d={`M${x + l} ${y} l${p} ${-d} v${h} l${-p} ${d} z`} fill={t.cote} stroke={t.trait} strokeWidth="1.2" />
      <path d={`M${x} ${y} l${p} ${-d} h${l} l${-p} ${d} z`} fill={t.dessus} stroke={t.trait} strokeWidth="1.2" />
      <rect x={x} y={y} width={l} height={h} rx="6" fill={t.face} stroke={t.trait} strokeWidth="1.2" />
      {Array.from({ length: ports }, (_, i) => {
        const py = y + h * 0.28 + i * 15;
        return <rect key={i} x={x + l / 2 - 11} y={py} width="22" height="7" rx="3.5" fill={t.port} />;
      })}
      {/* Éclair vert, en bas de la face avant (pas de place sous trois ports). */}
      {ports < 3 && <path transform={`translate(${x + l / 2 - 5} ${y + h - 20})`} d="M6 0 L0 9 H4.5 L3 16 L10 6 H5.5 Z" fill="#19c37d" />}
    </g>
  );
}

export function Illustration({ forme = 'cube', teinte = 'blanc', taille = 160 }: { forme?: Forme; teinte?: Teinte; taille?: number }) {
  const t = TEINTES[teinte];
  let dessin: React.ReactNode;
  switch (forme) {
    case 'compact':
      dessin = <Boite x={74} y={52} l={46} h={50} p={22} t={t} ports={1} />;
      break;
    case 'cube':
      dessin = <Boite x={66} y={46} l={58} h={58} p={26} t={t} ports={1} />;
      break;
    case 'gan':
      dessin = <Boite x={70} y={34} l={52} h={74} p={26} t={t} ports={3} />;
      break;
    case 'brique':
      dessin = <Boite x={56} y={40} l={78} h={68} p={30} t={t} ports={3} />;
      break;
    case 'magsafe':
      dessin = (
        <g strokeLinejoin="round">
          <path d="M100 98 C 100 122, 140 118, 170 128" fill="none" stroke={t.trait} strokeWidth="7" strokeLinecap="round" />
          <path d="M100 98 C 100 122, 140 118, 170 128" fill="none" stroke={t.face} strokeWidth="4.5" strokeLinecap="round" />
          <ellipse cx="100" cy="84" rx="46" ry="20" fill={t.cote} stroke={t.trait} strokeWidth="1.2" />
          <ellipse cx="100" cy="78" rx="46" ry="20" fill={t.face} stroke={t.trait} strokeWidth="1.2" />
          <ellipse cx="100" cy="78" rx="30" ry="12" fill="none" stroke={t.trait} strokeWidth="1.2" opacity=".7" />
          <ellipse cx="100" cy="78" rx="6" ry="2.6" fill={t.trait} opacity=".6" />
        </g>
      );
      break;
    case 'pad':
      dessin = (
        <g strokeLinejoin="round">
          <path d="M150 92 C 168 98, 172 112, 182 124" fill="none" stroke={t.trait} strokeWidth="6" strokeLinecap="round" />
          <ellipse cx="96" cy="94" rx="62" ry="22" fill={t.cote} stroke={t.trait} strokeWidth="1.2" />
          <ellipse cx="96" cy="86" rx="62" ry="22" fill={t.face} stroke={t.trait} strokeWidth="1.2" />
          <ellipse cx="96" cy="86" rx="44" ry="14" fill={t.dessus} stroke={t.trait} strokeWidth="1" opacity=".8" />
          <circle cx="96" cy="99" r="2.2" fill="#3ec27a" />
        </g>
      );
      break;
    case 'support':
      dessin = (
        <g strokeLinejoin="round">
          <ellipse cx="100" cy="112" rx="44" ry="12" fill={t.cote} stroke={t.trait} strokeWidth="1.2" />
          <path d="M86 112 L 96 50 h 26 L 120 112 z" fill={t.cote} stroke={t.trait} strokeWidth="1.2" />
          <rect x="74" y="26" width="58" height="80" rx="12" transform="rotate(-8 103 66)" fill={t.face} stroke={t.trait} strokeWidth="1.2" />
          <circle cx="104" cy="62" r="14" fill="none" stroke={t.trait} strokeWidth="1.2" opacity=".7" />
        </g>
      );
      break;
    case 'cable':
      dessin = (
        <g strokeLinecap="round" strokeLinejoin="round">
          <path d="M60 104 C 30 104, 30 60, 64 58 S 110 84, 132 62 S 168 50, 160 82 S 120 112, 96 96" fill="none" stroke={t.trait} strokeWidth="7" />
          <path d="M60 104 C 30 104, 30 60, 64 58 S 110 84, 132 62 S 168 50, 160 82 S 120 112, 96 96" fill="none" stroke={t.face} strokeWidth="4.5" />
          <rect x="58" y="98" width="30" height="13" rx="5" fill={t.face} stroke={t.trait} strokeWidth="1.2" />
          <rect x="86" y="101" width="12" height="7" rx="3" fill="#b7bcb9" stroke="#8d938f" />
          <rect x="84" y="88" width="28" height="13" rx="5" transform="rotate(-25 98 94)" fill={t.face} stroke={t.trait} strokeWidth="1.2" />
        </g>
      );
      break;
  }
  return (
    <svg viewBox="0 0 200 150" width={taille} height={taille * 0.75} role="presentation" aria-hidden="true" focusable="false">
      <ellipse cx="100" cy="132" rx="70" ry="7" fill="#000" opacity=".07" />
      {dessin}
    </svg>
  );
}
