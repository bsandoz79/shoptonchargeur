import type { Appareil } from './types';

/** Ce que le navigateur laisse deviner : le téléphone exact, ou seulement sa marque (un iPhone ne dit pas son modèle). */
export interface Detection { telephone?: Appareil; marque?: string }

/** Longueur minimale d'une référence pour qu'un simple début suffise (« SM-S921 » reconnaît « SM-S921B »). */
const DEBUT_MIN = 6;

/**
 * Téléphone dont une référence correspond au modèle annoncé par le navigateur : égalité d'abord, sinon le début le plus
 * long (références d'au moins 6 caractères).
 */
export function trouverParModele<T extends Appareil>(appareils: T[], modele: string): T | undefined {
  const m = modele.trim().toLowerCase();
  if (!m) return undefined;
  let meilleur: { a: T; longueur: number } | undefined;
  for (const a of appareils) {
    for (const code of a.codes ?? []) {
      const c = code.toLowerCase();
      if (m === c) return a;
      if (c.length >= DEBUT_MIN && m.startsWith(c) && (!meilleur || c.length > meilleur.longueur)) meilleur = { a, longueur: c.length };
    }
  }
  return meilleur?.a;
}

/** Modèle Android lu dans l'ancien « user agent » (« … Android 14; SM-S921B Build/… »). « K » : modèle masqué par Chrome. */
export function modeleDepuisUA(ua: string): string | undefined {
  const modele = /Android [\d.]+; ([^;)]+?)(?: Build\/|\))/.exec(ua)?.[1]?.trim();
  return modele && modele !== 'K' ? modele : undefined;
}

const MARQUES: [RegExp, string][] = [
  [/^SM-/i, 'Samsung'],
  [/^Pixel/i, 'Google'],
  [/xiaomi|redmi/i, 'Xiaomi'],
  [/poco/i, 'POCO'],
  [/oneplus/i, 'OnePlus'],
  [/^moto/i, 'Motorola'],
];

/** Détection à partir du modèle annoncé et du « user agent » (fonction pure, testée). */
export function analyser(appareils: Appareil[], ua: string, modeleAnnonce?: string): Detection {
  if (/iPhone/.test(ua)) return { marque: 'Apple' };
  const modele = modeleAnnonce?.trim() || modeleDepuisUA(ua);
  if (!modele) return {};
  const telephone = trouverParModele(appareils, modele);
  if (telephone) return { telephone, marque: telephone.marque };
  const marque = MARQUES.find(([motif]) => motif.test(modele))?.[1];
  return marque ? { marque } : {};
}

interface NavigateurAvecIndices {
  userAgentData?: { getHighEntropyValues?: (cles: string[]) => Promise<{ model?: string }> };
}

/** Tente de reconnaître l'appareil du visiteur. Rien n'est envoyé : tout reste dans le navigateur. */
export async function detecter(appareils: Appareil[]): Promise<Detection> {
  if (typeof navigator === 'undefined') return {};
  let modele: string | undefined;
  try {
    modele = (await (navigator as NavigateurAvecIndices).userAgentData?.getHighEntropyValues?.(['model']))?.model;
  } catch { /* indices refusés : on se contente du « user agent » */ }
  return analyser(appareils, navigator.userAgent, modele);
}
