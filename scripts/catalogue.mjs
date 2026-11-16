// Construit src/data/catalogue.json : tous les téléphones Android des marques suivies, à partir de la liste officielle des
// appareils Google Play (nom commercial et références de modèle). Cette liste ne donne aucune donnée de charge : les fiches
// vérifiées restent dans telephones.json.
//   node scripts/catalogue.mjs [chemin/vers/supported_devices.csv]
// Sans chemin, la liste est téléchargée chez Google.
import { readFileSync, writeFileSync } from 'node:fs';

const SOURCE = 'https://storage.googleapis.com/play_public/supported_devices.csv';
const SORTIE = new URL('../src/data/catalogue.json', import.meta.url);

/** Marques suivies : nom dans la liste Google → nom affiché. */
const MARQUES = {
  Samsung: 'Samsung', Google: 'Google', Xiaomi: 'Xiaomi', Redmi: 'Xiaomi', POCO: 'POCO', OnePlus: 'OnePlus', Oppo: 'OPPO', OPPO: 'OPPO',
  realme: 'realme', Realme: 'realme', Honor: 'HONOR', HONOR: 'HONOR', Huawei: 'Huawei', Motorola: 'Motorola', Nothing: 'Nothing', Sony: 'Sony',
  Asus: 'ASUS', Vivo: 'vivo', vivo: 'vivo', Fairphone: 'Fairphone', Nokia: 'Nokia', 'HMD Global': 'Nokia', HMD: 'HMD', TCL: 'TCL', Wiko: 'Wiko',
  Crosscall: 'Crosscall', ZTE: 'ZTE', nubia: 'nubia', Nubia: 'nubia', Tecno: 'TECNO', TECNO: 'TECNO', Infinix: 'Infinix', LGE: 'LG',
  'TCT (Alcatel)': 'Alcatel', Blackview: 'Blackview', Ulefone: 'Ulefone', Doogee: 'DOOGEE', Oukitel: 'OUKITEL', Lenovo: 'Lenovo', HTC: 'HTC',
  Doro: 'Doro', Cat: 'Cat', Meizu: 'Meizu', Sharp: 'Sharp', iQOO: 'iQOO', CMF: 'Nothing',
};
/** Ce qui n'est pas un téléphone : tablettes, montres, téléviseurs, ordinateurs, objets connectés. */
const PAS_UN_TELEPHONE = /\b(emulator|emualtor|chromebox|chromebase|pixelbook|detachable|reference|sdk|on pc|play edition|tab|tablet|tablette|pad|matepad|mediapad|watch|gear|wear|tv|bravia|book|chromebook|laptop|box|stick|buds|band|fit|projector|soundbar|hub|glass|vr|auto|car|kids|galaxy view|smart display|home|nest|chromecast|glasses|camera|walkman|xperia tablet|zenpad|yoga|thinkpad|ideapad|transformer|memo pad|nexus [0-9]+ ?(?:\(|$)|pixel c|pixel slate|pixel tablet)\b|\d{1,2}\.\d ?(?:"|inch|pouces)?$|\b(?:7|8|10|11|12)\.\d\b/i;

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
  if (PAS_UN_TELEPHONE.test(nom)) continue;
  // Nom commercial absent : la liste répète la référence (« SM-G950F ») ou un nom de code.
  // (Un nom en plusieurs mots identique à la référence est un vrai nom : « Pixel 8 ».)
  if (!/\s/.test(nom) && (normaliser(nom) === normaliser(code) || (/^[A-Z]{1,4}[-_]?[A-Z0-9]{3,}$/.test(nom) && /\d{3}/.test(nom)))) continue;
  const cle = `${marque}|${normaliser(nom)}`;
  const fiche = modeles.get(cle) ?? { marque, modele: nom, codes: new Set() };
  fiche.codes.add(code.trim());
  modeles.set(cle, fiche);
}

// Les iPhone ne figurent pas dans la liste Google (Android) : ceux sans fiche vérifiée sont ajoutés ici, sans référence.
// Leur année de sortie sert à les ranger parmi les autres iPhone.
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
console.log(`${catalogue.length} téléphones`, parMarque);
