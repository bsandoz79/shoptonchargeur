/**
 * Ce qu'on peut dire de la charge d'un téléphone quand sa fiche n'est pas vérifiée : des généralités par marque, sans
 * aucun chiffre propre au modèle.
 */

/** Marques dont la charge la plus rapide passe par leur propre technologie, donc par leur propre chargeur. */
const CHARGE_PROPRE = new Set(['Xiaomi', 'POCO', 'OnePlus', 'OPPO', 'realme', 'vivo', 'iQOO', 'HONOR', 'Huawei', 'Infinix', 'TECNO']);

export const chargePropreALaMarque = (marque: string) => CHARGE_PROPRE.has(marque);

/** Conseil général pour une marque. */
export function conseilMarque(marque: string): string {
  if (marque === 'Samsung') {
    return 'Les Galaxy récents chargent en Power Delivery avec PPS, à 25 W pour la plupart et 45 W pour certains. Prends un chargeur PPS, sinon la charge sera nettement plus lente.';
  }
  if (marque === 'Google') {
    return 'Les Pixel chargent en Power Delivery, et les récents ont besoin du PPS pour aller à pleine vitesse. Un chargeur PPS de 30 W ou plus fera l’affaire.';
  }
  if (marque === 'Apple') {
    return 'Un iPhone charge vite avec n’importe quel chargeur USB-C Power Delivery de 20 W ou plus.';
  }
  if (chargePropreALaMarque(marque)) {
    return `${marque} a souvent sa propre charge rapide. Pour la vitesse maximale, il faut le chargeur de la marque, celui fourni avec le téléphone ou le même modèle. Un chargeur USB-C Power Delivery marche aussi, en plus lent.`;
  }
  return 'La plupart des téléphones récents chargent en USB-C Power Delivery. Un chargeur PD avec PPS de 30 à 45 W ira avec presque tous.';
}
