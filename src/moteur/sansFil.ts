import type { Forme, Teinte, Telephone } from './types';

/** Un chargeur sans fil (src/data/chargeurs-sans-fil.json). */
export interface ChargeurSansFil {
  id: string;
  marque: string;
  nom: string;
  /** MagSafe : chargeur magnétique Apple ; Qi2 : chargeur magnétique standard ; Qi : socle ou tapis standard. */
  norme: 'magsafe' | 'qi2' | 'qi';
  puissanceW: number;
  fiabilite: 2 | 3;
  budget: 1 | 2 | 3;
  requete: string;
  /** Identifiant Amazon (ASIN) : lien direct vers la page du produit. */
  asin?: string;
  forme: Forme;
  teinte: Teinte;
  /** Bloc secteur à associer, en watts (vendu à part), s'il n'est pas fourni. */
  adaptateurW?: number;
  /** Réservé aux Pixel (vitesse maximale seulement avec eux). */
  reservePixel?: boolean;
  note?: string;
}

export interface PropositionSansFil {
  chargeur: ChargeurSansFil;
  /** Puissance obtenue ; `null` : inconnue (la fiche du téléphone ne donne pas sa puissance sans fil). */
  puissanceObtenueW: number | null;
  pourquoi: string;
}

/**
 * Chargeurs sans fil pour un téléphone à fiche vérifiée.
 * - iPhone MagSafe : chargeurs magnétiques (MagSafe jusqu'à 25 W sur iPhone 16, Qi2 jusqu'à 15 W) ; un tapis Qi se
 *   limite à 7,5 W sur iPhone, inutile de le proposer.
 * - Téléphone Qi (Android, anciens iPhone) : tapis et supports Qi ; les chargeurs magnétiques ne tiennent pas sans coque
 *   aimantée, ils ne sont pas proposés. Le Pixel Stand, réservé aux Pixel.
 * Aucune proposition si le téléphone n'a pas la recharge sans fil.
 */
export function proposerSansFil(t: Telephone, chargeurs: ChargeurSansFil[]): PropositionSansFil[] {
  const sf = t.sansFil;
  if (!sf) return [];
  const plafond = (w: number) => (sf.maxW === undefined ? null : Math.min(sf.maxW, w));
  const liste: PropositionSansFil[] = [];
  for (const c of chargeurs) {
    if (c.marque === 'Samsung' && t.marque !== 'Samsung') continue;
    if (c.reservePixel && t.marque !== 'Google') continue;
    if (sf.norme === 'magsafe') {
      if (c.norme === 'qi') continue;
      const w = c.norme === 'magsafe' ? plafond(c.puissanceW) : plafond(Math.min(15, c.puissanceW));
      liste.push({
        chargeur: c, puissanceObtenueW: w,
        pourquoi: c.norme === 'magsafe'
          ? `Il se fixe au dos de ton iPhone avec les aimants, toujours bien centré, donc à pleine puissance${w ? ` (${w} W sur ton modèle)` : ''}.`
          : `Le Qi2 utilise les mêmes aimants que MagSafe, sans être signé Apple. Il charge ton iPhone jusqu’à ${w ?? 15} W, pour moins cher.`,
      });
    } else {
      if (c.norme !== 'qi') continue;
      const w = plafond(c.puissanceW);
      liste.push({
        chargeur: c, puissanceObtenueW: w,
        pourquoi: c.reservePixel
          ? 'Fait par Google pour les Pixel, c’est avec lui qu’ils chargent le plus vite sans fil. Il fait aussi réveil sur la table de nuit.'
          : c.marque === t.marque
            ? `Le chargeur ${t.marque} active la recharge sans fil rapide de ton téléphone.`
            : 'Ton téléphone est compatible Qi. Pose-le au milieu du tapis, il n’y a pas d’aimant pour le guider.',
      });
    }
  }
  return liste.sort((a, b) => (b.puissanceObtenueW ?? 0) - (a.puissanceObtenueW ?? 0) || b.chargeur.fiabilite - a.chargeur.fiabilite || a.chargeur.budget - b.chargeur.budget);
}
