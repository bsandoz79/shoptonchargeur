import { pointsQualitePrix } from './qualitePrix';

/**
 * Note d'un chargeur pour l'appareil choisi, en quatre niveaux de couleur :
 * - Idéal (vert foncé) : vitesse maximale, et bon équilibre fiabilité/prix (barème qualité/prix d'au moins 3 points) ;
 * - Très bon (vert clair) : vitesse maximale ;
 * - Compatible (jaune) : charge bien, mais pas à la vitesse maximale (au moins la moitié), ou vitesse inconnue ;
 * - Charge lente (orange) : moins de la moitié de la vitesse possible.
 */
export type Evaluation = 'ideal' | 'tresbon' | 'compatible' | 'lent';

export const EVALUATIONS: Record<Evaluation, { libelle: string; sens: string }> = {
  ideal: { libelle: 'Idéal', sens: 'vitesse maximale, fiable et bien placé en prix' },
  tresbon: { libelle: 'Très bon', sens: 'vitesse maximale' },
  compatible: { libelle: 'Compatible', sens: 'marche bien, mais pas le plus rapide' },
  lent: { libelle: 'Charge lente', sens: 'à éviter si tu es pressé' },
};

/** `part` : part de la vitesse maximale obtenue (1 = maximale) ; `null` si on ne la connaît pas. */
export function evaluer(part: number | null, fiabilite: 2 | 3, budget: 1 | 2 | 3): Evaluation {
  if (part === null) return 'compatible';
  if (part < 0.5) return 'lent';
  if (part < 1) return 'compatible';
  return pointsQualitePrix(part, fiabilite, budget) >= 3 ? 'ideal' : 'tresbon';
}
