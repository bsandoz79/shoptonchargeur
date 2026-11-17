import { pointsQualitePrix } from './qualitePrix';

/** Ce que la sélection a besoin de savoir d'un produit proposé (chargeur secteur ou sans fil). */
export interface Candidat {
  id: string;
  marque: string;
  fiabilite: 2 | 3;
  budget: 1 | 2 | 3;
  puissanceW: number;
  /** Part de la vitesse maximale de l'appareil obtenue (0 à 1) ; `null` : inconnue. */
  part: number | null;
  /** Chargeur d'origine d'une marque à charge propriétaire. */
  origine?: boolean;
}

/** Les priorités d'achat : le chargeur du constructeur, le meilleur rapport qualité/prix, puis les autres. */
export interface Selection<T> { constructeur?: T; qualitePrix?: T; autres: T[] }

/**
 * Range les produits proposés pour un appareil, par priorité d'achat :
 * 1. le chargeur préconisé par le constructeur : celui de la marque de l'appareil (ou son chargeur d'origine) qui donne
 *    la vitesse maximale, le moins puissant d'entre eux (inutile de payer plus) ; à défaut, le plus rapide de la marque ;
 * 2. le meilleur rapport qualité/prix parmi les autres : barème de `qualitePrix`, en ne gardant que les produits qui
 *    donnent la vitesse maximale s'il y en a ; à égalité, le moins cher, puis le plus fiable ;
 * 3. les autres, dans l'ordre reçu (le tri choisi par le visiteur).
 */
export function selectionner<T>(marque: string, produits: T[], vers: (p: T) => Candidat): Selection<T> {
  const avec = produits.map((p) => ({ p, c: vers(p) }));
  const deLaMarque = avec.filter(({ c }) => c.origine || c.marque === marque);
  const rapides = deLaMarque.filter(({ c }) => c.part === null || c.part >= 1);
  const constructeur = (rapides.length ? rapides : deLaMarque)
    .sort((a, b) => Number(!!b.c.origine) - Number(!!a.c.origine)
      || (rapides.length ? a.c.puissanceW - b.c.puissanceW : (b.c.part ?? 0) - (a.c.part ?? 0)))[0];

  const reste = avec.filter((x) => x !== constructeur);
  const complets = reste.filter(({ c }) => c.part === null || c.part >= 1);
  const qp = (complets.length ? complets : reste)
    .map((x) => ({ ...x, points: pointsQualitePrix(x.c.part, x.c.fiabilite, x.c.budget) }))
    .sort((a, b) => b.points - a.points || a.c.budget - b.c.budget || b.c.fiabilite - a.c.fiabilite || a.c.puissanceW - b.c.puissanceW)[0];

  return {
    constructeur: constructeur?.p,
    qualitePrix: qp?.p,
    autres: produits.filter((p) => p !== constructeur?.p && p !== qp?.p),
  };
}
