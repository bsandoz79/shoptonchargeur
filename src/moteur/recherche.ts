import type { Appareil } from './types';

/** Texte sans accents ni majuscules, « + » lu « plus » : « Galaxy S24+ » et « galaxy s24 plus » se trouvent l'un l'autre. */
export const normaliser = (texte: string) =>
  texte.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\+/g, ' plus ').replace(/[^a-z0-9]+/g, ' ').trim();

const ordreNaturel = new Intl.Collator('fr', { numeric: true });

/** Nom à afficher : la marque n'est pas répétée quand le modèle la porte déjà (« OnePlus 12 », « motorola edge 50 »). */
export const nomComplet = (a: Appareil) =>
  (normaliser(a.modele).startsWith(normaliser(a.marque)) ? a.modele : `${a.marque} ${a.modele}`);
/** Premier numéro du nom (« 11 » pour « Pixel 11 Pro ») ; -1 s'il n'y en a pas : les modèles numérotés passent devant. */
const numero = (modele: string) => Number(/\d+/.exec(modele)?.[0] ?? -1);

/** Marques les plus répandues : à pertinence égale, leurs modèles passent avant ceux des autres marques. */
const GRANDES_MARQUES = ['Samsung', 'Apple', 'Google', 'Xiaomi', 'POCO', 'OnePlus', 'OPPO', 'HONOR', 'Motorola', 'realme', 'Nothing', 'Huawei', 'Sony', 'vivo'];
const rangMarque = (marque: string) => { const i = GRANDES_MARQUES.indexOf(marque); return i < 0 ? GRANDES_MARQUES.length : i; };

/**
 * Téléphones dont la marque ou le modèle contiennent tous les mots saisis (début de mot) : « s » propose les S25, S24,
 * S23…, « s24 ultra » le Galaxy S24 Ultra, sans avoir à écrire la marque.
 * Ordre : le modèle exact ; puis les modèles dont chaque mot saisi est un mot entier du nom ou le début d'un numéro
 * (« s » → « S25 », pas « Sidekick ») ; puis ceux dont le nom porte tous les mots ; enfin ceux trouvés par la marque.
 * À égalité : les grandes marques, puis les numéros décroissants (S25 Ultra, S25+, S25, S24…). Les iPhone, dont les
 * noms ne se suivent pas (X, SE, Air), sont rangés par année.
 */
export function chercher<T extends Appareil>(appareils: T[], saisie: string, limite = 30): T[] {
  const mots = normaliser(saisie).split(' ').filter(Boolean);
  if (!mots.length) return [];
  const cible = mots.join(' ');
  const commence = (texte: string, mot: string) => ` ${texte}`.includes(` ${mot}`);
  // Le mot saisi est un mot entier du nom, ou la lettre d'une gamme suivie de son numéro (« s » dans « s25 »).
  const net = (texte: string, mot: string) => texte.split(' ').some((m) => m.startsWith(mot) && /^\d*$/.test(m.slice(mot.length)));
  const trouves: { a: T; modele: string; score: number; mot: string }[] = [];
  for (const a of appareils) {
    const modele = normaliser(a.modele);
    const marque = normaliser(a.marque);
    if (!mots.every((mot) => commence(modele, mot) || commence(marque, mot))) continue;
    const exact = modele === cible || `${marque} ${modele}` === cible;
    // Mots portés par le nom du modèle hors nom de gamme (« galaxy », « iphone »… restent des mots du modèle).
    const parLeModele = mots.every((mot) => commence(modele, mot));
    const nets = parLeModele && mots.every((mot) => net(modele, mot));
    // Mot du nom qui répond au premier mot saisi (« s25 » pour « s ») : c'est lui qui range les modèles d'une gamme.
    const candidats = modele.split(' ').filter((m) => m.startsWith(mots[0]));
    const mot = candidats.find((m) => /^\d*$/.test(m.slice(mots[0].length))) ?? candidats[0] ?? '';
    trouves.push({ a, modele, mot, score: exact ? 4 : nets ? 3 : parLeModele ? 2 : 1 });
  }
  return trouves
    .sort((x, y) =>
      y.score - x.score
      || rangMarque(x.a.marque) - rangMarque(y.a.marque)
      || (x.a.marque === 'Apple' && y.a.marque === 'Apple' ? (y.a.annee ?? 0) - (x.a.annee ?? 0) : 0)
      || ordreNaturel.compare(y.mot, x.mot)
      || (x.a.marque === y.a.marque ? numero(y.modele) - numero(x.modele) : 0)
      || ordreNaturel.compare(`${y.a.marque} ${y.modele}`, `${x.a.marque} ${x.modele}`))
    .slice(0, limite)
    .map(({ a }) => a);
}
