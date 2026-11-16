import type { Telephone } from './types';

/** Ce que le navigateur laisse deviner : le téléphone exact, ou seulement sa marque (un iPhone ne dit pas son modèle). */
export interface Detection { telephone?: Telephone; marque?: string }

/** Téléphone dont une référence correspond au modèle annoncé par le navigateur (égalité d'abord, sinon début le plus long). */
export function trouverParModele(telephones: Telephone[], modele: string): Telephone | undefined {
  const m = modele.trim().toLowerCase();
  if (!m) return undefined;
  let meilleur: { t: Telephone; longueur: number } | undefined;
  for (const t of telephones) {
    for (const code of t.codes ?? []) {
      const c = code.toLowerCase();
      if (m === c) return t;
      if (m.startsWith(c) && (!meilleur || c.length > meilleur.longueur)) meilleur = { t, longueur: c.length };
    }
  }
  return meilleur?.t;
}

/** Modèle Android lu dans l'ancien « user agent » (« … Android 14; SM-S921B Build/… »). « K » : modèle masqué par Chrome. */
export function modeleDepuisUA(ua: string): string | undefined {
  const modele = /Android [\d.]+; ([^;)]+?)(?: Build\/|\))/.exec(ua)?.[1]?.trim();
  return modele && modele !== 'K' ? modele : undefined;
}

const MARQUES: [RegExp, string][] = [
  [/^SM-/i, 'Samsung'],
  [/^Pixel/i, 'Google'],
  [/xiaomi|redmi|poco/i, 'Xiaomi'],
  [/oneplus/i, 'OnePlus'],
];

/** Détection à partir du modèle annoncé et du « user agent » (fonction pure, testée). */
export function analyser(telephones: Telephone[], ua: string, modeleAnnonce?: string): Detection {
  if (/iPhone/.test(ua)) return { marque: 'Apple' };
  const modele = modeleAnnonce?.trim() || modeleDepuisUA(ua);
  if (!modele) return {};
  const telephone = trouverParModele(telephones, modele);
  if (telephone) return { telephone, marque: telephone.marque };
  const marque = MARQUES.find(([motif]) => motif.test(modele))?.[1];
  return marque ? { marque } : {};
}

interface NavigateurAvecIndices {
  userAgentData?: { getHighEntropyValues?: (cles: string[]) => Promise<{ model?: string }> };
}

/** Tente de reconnaître l'appareil du visiteur. Rien n'est envoyé : tout reste dans le navigateur. */
export async function detecter(telephones: Telephone[]): Promise<Detection> {
  if (typeof navigator === 'undefined') return {};
  let modele: string | undefined;
  try {
    modele = (await (navigator as NavigateurAvecIndices).userAgentData?.getHighEntropyValues?.(['model']))?.model;
  } catch { /* indices refusés : on se contente du « user agent » */ }
  return analyser(telephones, navigator.userAgent, modele);
}
