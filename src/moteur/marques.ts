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
    return 'Les Galaxy récents se rechargent vite en « Power Delivery » avec « PPS » : 25 W sur la plupart des modèles, 45 W sur certains. Un chargeur PPS convient dans les deux cas ; sans PPS, la charge est nettement plus lente.';
  }
  if (marque === 'Google') {
    return 'Les Pixel se rechargent en « Power Delivery » ; les modèles récents demandent le « PPS » pour atteindre leur vitesse maximale. Un chargeur PPS de 30 W ou plus convient.';
  }
  if (marque === 'Apple') {
    return 'Les iPhone se rechargent vite avec un chargeur USB-C « Power Delivery » de 20 W ou plus.';
  }
  if (chargePropreALaMarque(marque)) {
    return `${marque} utilise le plus souvent sa propre charge rapide : la vitesse maximale demande le chargeur de la marque (celui fourni avec le téléphone, ou le même modèle). Un chargeur USB-C « Power Delivery » fonctionne aussi, mais plus lentement.`;
  }
  return 'La plupart des téléphones récents se rechargent en USB-C « Power Delivery ». Un chargeur Power Delivery avec « PPS » de 30 à 45 W est le choix le plus polyvalent.';
}
