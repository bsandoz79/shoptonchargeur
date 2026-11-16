// Construit src/data/catalogue.json : les téléphones Android récents (port USB-C) des marques suivies, à partir de la liste
// officielle des appareils Google Play (nom commercial et références de modèle), plus les iPhone. Cette liste ne donne ni
// le port ni la charge : les gammes à port USB-C sont reconnues par leur nom (règles ci-dessous), et les fiches de charge
// vérifiées restent dans telephones.json.
//   node scripts/catalogue.mjs [chemin/vers/supported_devices.csv]
// Sans chemin, la liste est téléchargée chez Google.
import { readFileSync, writeFileSync } from 'node:fs';

const SOURCE = 'https://storage.googleapis.com/play_public/supported_devices.csv';
const SORTIE = new URL('../src/data/catalogue.json', import.meta.url);

/** Marques suivies : nom dans la liste Google → nom affiché. */
const MARQUES = {
  Samsung: 'Samsung', Google: 'Google', Xiaomi: 'Xiaomi', Redmi: 'Xiaomi', POCO: 'POCO', OnePlus: 'OnePlus', Oppo: 'OPPO', OPPO: 'OPPO',
  realme: 'realme', Realme: 'realme', Honor: 'HONOR', HONOR: 'HONOR', Huawei: 'Huawei', Motorola: 'Motorola', Nothing: 'Nothing', CMF: 'Nothing',
  Sony: 'Sony', Asus: 'ASUS', Vivo: 'vivo', vivo: 'vivo', iQOO: 'iQOO', Fairphone: 'Fairphone', Nokia: 'Nokia', 'HMD Global': 'Nokia', HMD: 'HMD',
  TCL: 'TCL', ZTE: 'ZTE', nubia: 'nubia', Nubia: 'nubia', Tecno: 'TECNO', TECNO: 'TECNO', Infinix: 'Infinix',
};

/**
 * Gammes à port USB-C, par marque. Un nom qui contient « 5G » est toujours gardé (tous les téléphones 5G sont en USB-C).
 * Les règles sont volontairement prudentes : une gamme douteuse (entrée de gamme encore en micro-USB) est écartée.
 */
const USB_C = {
  // S8 et suivants, Note 8 et suivants, pliants, A11 à A99 (pas A0x ni A10), M11 et suivants, XCover récents.
  Samsung: /^Galaxy (S([89]|[1-9]\d)\b|Note ?([89]|[12]0)\b|Z (Flip|Fold)|Fold|A(1[1-9]|[2-9]\d)\b|M(1[1-9]|[2-9]\d)\b|F(1[2-9]|[2-9]\d)\b|XCover ?([5-9]|Pro))/i,
  Google: /^Pixel\b/i,
  OnePlus: /^OnePlus\b/i,
  Nothing: /./,
  Fairphone: /Fairphone ?[3-9]/i,
  HMD: /./,
  // Hors « 5G » : les gammes principales. Entrées de gamme en micro-USB écartées (Redmi 9A/9C/10A/12C/A1/A2, POCO C).
  Xiaomi: /^(Xiaomi (1\d|MIX)|Mi (9|1\d)\b|Redmi (Note (8|9|1\d)\b|1[0-5]\b(?!A|C)|K\d|Turbo)|REDMI (Note|K|Turbo))/i,
  POCO: /^POCO [FXM]\d/i,
  OPPO: /^(Find|Reno)/i,
  realme: /^realme (GT|[6-9]\b|1\d\b)/i,
  HONOR: /^HONOR (Magic|\d{2,3}\b)/i,
  Huawei: /^(HUAWEI )?(P[2-6]0|Mate ?([1-6]0|X)|Pura|nova (\d\d|[5-9])\b)/i,
  Motorola: /(edge|razr|thinkphone|moto g ?(\d{2,3}|[6-9])\b)/i,
  Sony: /^Xperia (1|5|10|PRO|XZ)/i,
  ASUS: /(ROG Phone|Zenfone ([5-9]|1\d)\b)/i,
  vivo: /^(vivo )?(X\d|V[2-9]\d)/i,
  iQOO: /./,
};
/** Ce qui n'est pas un téléphone : tablettes, montres, téléviseurs, ordinateurs, objets connectés. */
const PAS_UN_TELEPHONE = /\b(emulator|emualtor|chromebox|chromebase|pixelbook|detachable|reference|sdk|on pc|play edition|tab|tablet|tablette|pad|matepad|mediapad|watch|gear|wear|tv|book|chromebook|laptop|box|stick|buds|band|fit|projector|hub|glass|vr|auto|car|kids|pixel c|pixel slate|pixel tablet)\b/i;

const normaliser = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\+/g, ' plus ').replace(/[^a-z0-9]+/g, ' ').trim();

function lireCsv(texte) {
  // Champs séparés par des virgules, parfois entre guillemets (guillemet doublé = guillemet).
  return texte.split(/\r?\n/).map((ligne) => {
    const champs = []; let champ = ''; let cite = false;
    for (let i = 0; i < ligne.length; i++) {
      const c = ligne[i];
      if (cite) { if (c === '"' && ligne[i + 1] === '"') { champ += '"'; i++; } else if (c === '"') cite = false; else champ += c; }
      else if (c === '"') cite = true;
      else if (c === ',') { champs.push(champ); champ = ''; }
      else champ += c;
    }
    champs.push(champ);
    return champs;
  });
}

const chemin = process.argv[2];
const octets = chemin ? readFileSync(chemin) : Buffer.from(await (await fetch(SOURCE)).arrayBuffer());
const lignes = lireCsv(new TextDecoder('utf-16').decode(octets)).slice(1);

const modeles = new Map();
for (const [marqueGoogle, nomBrut = '', , code = ''] of lignes) {
  const marque = MARQUES[marqueGoogle?.trim()];
  const nom = nomBrut.replace(/\s+/g, ' ').trim();
  if (!marque || nom.length < 2 || nom.length > 40 || !code.trim()) continue;
  // Une taille d'écran dans le nom (« Galaxy Note 10.1 ») : une tablette.
  if (PAS_UN_TELEPHONE.test(nom) || /\b\d{1,2}\.\d\b/.test(nom)) continue;
  // Nom commercial absent : la liste répète la référence (« SM-G950F ») ou un nom de code.
  // (Un nom en plusieurs mots identique à la référence est un vrai nom : « Pixel 8 ».)
  if (!/\s/.test(nom) && (normaliser(nom) === normaliser(code) || (/^[A-Z]{1,4}[-_]?[A-Z0-9]{3,}$/.test(nom) && /\d{3}/.test(nom)))) continue;
  if (!/\b5G\b/i.test(nom) && !USB_C[marque]?.test(nom)) continue;
  const cle = `${marque}|${normaliser(nom)}`;
  const fiche = modeles.get(cle) ?? { marque, modele: nom, codes: new Set() };
  fiche.codes.add(code.trim());
  modeles.set(cle, fiche);
}

// Les iPhone ne figurent pas dans la liste Google (Android) : ceux sans fiche vérifiée sont ajoutés ici, sans référence.
// Leur année de sortie sert à les ranger parmi les autres iPhone. Tous ont un port Lightning ou USB-C.
const IPHONE = { 'iPhone 17': 2025, 'iPhone 17 Pro': 2025, 'iPhone 17 Pro Max': 2025, 'iPhone Air': 2025, 'iPhone 7': 2016, 'iPhone 7 Plus': 2016,
  'iPhone SE (2016)': 2016, 'iPhone 6s': 2015, 'iPhone 6s Plus': 2015 };
for (const [nom, annee] of Object.entries(IPHONE)) {
  modeles.set(`Apple|${normaliser(nom)}`, { marque: 'Apple', modele: nom, codes: new Set(), annee });
}

// Format compact : [marque, modèle, références, année si connue]. Trié pour des différences lisibles d'une mise à jour à l'autre.
const catalogue = [...modeles.values()]
  .map((f) => [f.marque, f.modele, [...f.codes].sort(), ...(f.annee ? [f.annee] : [])])
  .sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1], 'fr', { numeric: true }));
writeFileSync(SORTIE, `[\n${catalogue.map((l) => JSON.stringify(l)).join(',\n')}\n]\n`);

const parMarque = {};
for (const [marque] of catalogue) parMarque[marque] = (parMarque[marque] ?? 0) + 1;
console.log(`${catalogue.length} téléphones`, JSON.stringify(parMarque));
