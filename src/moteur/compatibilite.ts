import type { Chargeur, Proposition, Telephone, Tri } from './types';

/** Puissance obtenue par ce téléphone avec ce chargeur (watts) ; `null` si elle n'est pas communiquée. */
export function puissanceObtenue(telephone: Telephone, chargeur: Chargeur): number | null {
  const sansProtocole = () =>
    telephone.puissanceSansProtocoleW === undefined ? null : Math.min(telephone.puissanceSansProtocoleW, chargeur.puissanceW);
  switch (telephone.protocole) {
    case 'pd':
      return chargeur.protocoles.includes('pd') ? Math.min(telephone.puissanceMaxW, chargeur.puissanceW) : sansProtocole();
    case 'pps':
      return chargeur.ppsMaxW ? Math.min(telephone.puissanceMaxW, chargeur.ppsMaxW) : sansProtocole();
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
 * marque à l'autre, la vitesse maximale n'est pas garantie (ex. les 45 W de Samsung demandent un PPS à 5 A).
 */
const MARQUES_DE_TELEPHONE = new Set(['Apple', 'Samsung', 'Google']);

/**
 * Chargeurs proposés pour un téléphone, triés : ceux de sa marque et ceux des fabricants d'accessoires. À critère égal,
 * l'ordre « vitesse » départage.
 */
export function proposer(telephone: Telephone, chargeurs: Chargeur[], tri: Tri = 'vitesse'): Proposition[] {
  const origine = chargeurOrigine(telephone);
  return [...(origine ? [origine] : []), ...chargeurs]
    .map((chargeur) => {
      const puissanceObtenueW = puissanceObtenue(telephone, chargeur);
      return { chargeur, puissanceObtenueW, maximale: puissanceObtenueW === telephone.puissanceMaxW };
    })
    .filter((p) => p.chargeur.marque === telephone.marque || !MARQUES_DE_TELEPHONE.has(p.chargeur.marque))
    .sort((a, b) => TRIS[tri](a, b) || TRIS.vitesse(a, b));
}
