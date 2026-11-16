import { chargePropreALaMarque } from './marques';
import type { Appareil, Chargeur, Proposition, Telephone, Tri } from './types';

/** Puissance obtenue par ce téléphone avec ce chargeur (watts) ; `null` si elle n'est pas communiquée. */
export function puissanceObtenue(telephone: Telephone, chargeur: Chargeur): number | null {
  const sansProtocole = () =>
    telephone.puissanceSansProtocoleW === undefined ? null : Math.min(telephone.puissanceSansProtocoleW, chargeur.puissanceW);
  switch (telephone.protocole) {
    case 'pd':
      return chargeur.protocoles.includes('pd') ? Math.min(telephone.puissanceMaxW, chargeur.puissanceW) : sansProtocole();
    case 'pps': {
      if (!chargeur.ppsMaxW) return sansProtocole();
      // Sans PPS à 5 A, un téléphone qui en a besoin pour ses 45 W plafonne à 25 W.
      const pps = telephone.cable5A && !chargeur.pps5A ? Math.min(chargeur.ppsMaxW, 25) : chargeur.ppsMaxW;
      return Math.min(telephone.puissanceMaxW, pps);
    }
    case 'proprietaire':
      return chargeur.origineDe === telephone.marque ? Math.min(telephone.puissanceMaxW, chargeur.puissanceW) : sansProtocole();
  }
}

/** Chargeur d'origine d'une marque à charge rapide propriétaire : le seul à donner la vitesse maximale. */
export function chargeurOrigine(telephone: Telephone): Chargeur | null {
  if (telephone.protocole !== 'proprietaire') return null;
  const techno = telephone.techno ? ` ${telephone.techno}` : '';
  return {
    id: `origine-${telephone.id}`,
    marque: telephone.marque,
    nom: `Chargeur d’origine ${telephone.puissanceMaxW} W${techno}`,
    puissanceW: telephone.puissanceMaxW,
    protocoles: ['proprietaire', 'pd'],
    fiabilite: 3,
    budget: 2,
    requete: `chargeur ${telephone.marque} ${telephone.puissanceMaxW}W${techno} original`,
    origineDe: telephone.marque,
  };
}

const TRIS: Record<Tri, (a: Proposition, b: Proposition) => number> = {
  // Le plus rapide d'abord ; à vitesse égale, le chargeur le moins surdimensionné, puis le plus fiable.
  vitesse: (a, b) =>
    (b.puissanceObtenueW ?? -1) - (a.puissanceObtenueW ?? -1)
    || a.chargeur.puissanceW - b.chargeur.puissanceW
    || b.chargeur.fiabilite - a.chargeur.fiabilite,
  puissance: (a, b) => b.chargeur.puissanceW - a.chargeur.puissanceW,
  prix: (a, b) => a.chargeur.budget - b.chargeur.budget,
  fiabilite: (a, b) => b.chargeur.fiabilite - a.chargeur.fiabilite,
};

/**
 * Marques de téléphones qui vendent leur propre chargeur. Il n'est proposé que pour les téléphones de la marque : d'une
 * marque à l'autre, la vitesse maximale n'est pas garantie.
 */
const MARQUES_DE_TELEPHONE = new Set(['Apple', 'Samsung', 'Google']);
const pourCetteMarque = (marque: string) => (c: Chargeur) => c.marque === marque || !MARQUES_DE_TELEPHONE.has(c.marque);

/**
 * Chargeurs proposés pour un téléphone à fiche vérifiée, triés : ceux de sa marque et ceux des grandes marques
 * d'accessoires. À critère égal, l'ordre « vitesse » départage.
 */
export function proposer(telephone: Telephone, chargeurs: Chargeur[], tri: Tri = 'vitesse'): Proposition[] {
  const origine = chargeurOrigine(telephone);
  return [...(origine ? [origine] : []), ...chargeurs.filter(pourCetteMarque(telephone.marque))]
    .map((chargeur) => {
      const puissanceObtenueW = puissanceObtenue(telephone, chargeur);
      return { chargeur, puissanceObtenueW, maximale: puissanceObtenueW === telephone.puissanceMaxW };
    })
    .sort((a, b) => TRIS[tri](a, b) || TRIS.vitesse(a, b));
}

/**
 * Chargeurs polyvalents pour un téléphone sans fiche vérifiée : aucune vitesse n'est annoncée. Par défaut (« vitesse »),
 * le chargeur de la marque d'abord, puis les chargeurs PPS (les plus polyvalents), du plus puissant au moins puissant.
 */
export function proposerSansFiche(appareil: Appareil, chargeurs: Chargeur[], tri: Tri = 'vitesse'): Proposition[] {
  const origine: Chargeur[] = chargePropreALaMarque(appareil.marque)
    ? [{
      id: `origine-${appareil.id}`, marque: appareil.marque, nom: `Chargeur d’origine ${appareil.marque}`, puissanceW: 0, protocoles: ['proprietaire'],
      fiabilite: 3, budget: 2, requete: `chargeur ${appareil.marque} ${appareil.modele} original`, origineDe: appareil.marque,
    }]
    : [];
  const polyvalence = (a: Proposition, b: Proposition) =>
    Number(!!b.chargeur.origineDe) - Number(!!a.chargeur.origineDe)
    || Number(b.chargeur.marque === appareil.marque) - Number(a.chargeur.marque === appareil.marque)
    || Number(!!b.chargeur.ppsMaxW) - Number(!!a.chargeur.ppsMaxW)
    || b.chargeur.puissanceW - a.chargeur.puissanceW;
  return [...origine, ...chargeurs.filter(pourCetteMarque(appareil.marque))]
    .map((chargeur) => ({ chargeur, puissanceObtenueW: null, maximale: false }))
    .sort((a, b) => (tri === 'vitesse' ? 0 : TRIS[tri](a, b)) || polyvalence(a, b));
}
