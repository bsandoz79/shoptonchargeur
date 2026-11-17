/**
 * Rapport qualité/prix : notre évaluation, pas une note d'acheteurs. Elle croise trois choses vérifiables : la vitesse
 * obtenue sur l'appareil choisi (part de sa vitesse maximale), la fiabilité (constructeur ou grande marque) et le niveau
 * de prix. Barème : 2 points pour la vitesse maximale (1 si au moins 60 %), 1 point pour un constructeur, 2 points pour
 * un petit prix (1 pour un prix moyen). 4 et plus : Excellent ; 3 : Très bon ; 2 : Bon ; en dessous : Moyen.
 */
export type Verdict = 'Excellent' | 'Très bon' | 'Bon' | 'Moyen';

/** Points du barème (0 à 5), pour comparer deux produits. */
export function pointsQualitePrix(partVitesse: number | null, fiabilite: 2 | 3, budget: 1 | 2 | 3): number {
  const vitesse = partVitesse === null ? 1 : partVitesse >= 1 ? 2 : partVitesse >= 0.6 ? 1 : 0;
  return vitesse + (fiabilite === 3 ? 1 : 0) + (budget === 1 ? 2 : budget === 2 ? 1 : 0);
}

export function qualitePrix(partVitesse: number | null, fiabilite: 2 | 3, budget: 1 | 2 | 3): Verdict {
  const points = pointsQualitePrix(partVitesse, fiabilite, budget);
  return points >= 4 ? 'Excellent' : points === 3 ? 'Très bon' : points === 2 ? 'Bon' : 'Moyen';
}

export const EXPLICATION_QUALITE_PRIX =
  'Notre évaluation, pas une note d’acheteurs : la vitesse obtenue sur ton appareil, la fiabilité de la marque et le niveau de prix.';
