import type { Telephone } from './types';

/** Texte sans accents ni majuscules, « + » lu « plus » : « Galaxy S24+ » et « galaxy s24 plus » se trouvent l'un l'autre. */
export const normaliser = (texte: string) =>
  texte.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\+/g, ' plus ').replace(/[^a-z0-9]+/g, ' ').trim();

/**
 * Téléphones dont la marque et le modèle contiennent tous les mots saisis (début de mot). Un modèle qui correspond
 * exactement passe en tête, puis les plus récents, puis les noms les plus courts.
 */
export function chercher(telephones: Telephone[], saisie: string, limite = 8): Telephone[] {
  const mots = normaliser(saisie).split(' ').filter(Boolean);
  if (!mots.length) return [];
  const cible = mots.join(' ');
  const exact = (x: { texte: string; modele: string }) => Number(x.modele === cible || x.texte === cible);
  return telephones
    .map((t) => ({ t, texte: normaliser(`${t.marque} ${t.modele}`), modele: normaliser(t.modele) }))
    .filter(({ texte }) => mots.every((mot) => ` ${texte}`.includes(` ${mot}`)))
    .sort((a, b) => exact(b) - exact(a) || b.t.annee - a.t.annee || a.texte.length - b.texte.length)
    .slice(0, limite)
    .map(({ t }) => t);
}
