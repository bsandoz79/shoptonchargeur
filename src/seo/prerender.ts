/**
 * Génération des pages pour les moteurs de recherche, après la construction du site (npm run build) :
 * une page HTML par téléphone vérifié, par ordinateur, plus l'accueil, le guide et les ordinateurs. Chaque page a son
 * titre, sa description, son adresse canonique, ses données structurées et son contenu en texte, lisible sans
 * JavaScript ; l'application le remplace ensuite. Puis sitemap.xml, robots.txt et llms.txt.
 * Construit par Vite en mode serveur (vite build --ssr), lancé par node.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { SITE } from './adresses';
import { echapper, toutesLesPages, type Page } from './pages';

const DIST = join(process.cwd(), 'dist');
const modele = readFileSync(join(DIST, 'index.html'), 'utf8');

function html(p: Page): string {
  const url = SITE + p.chemin;
  const tete = [
    `<title>${echapper(p.titre)}</title>`,
    `<meta name="description" content="${echapper(p.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:title" content="${echapper(p.titre)}" />`,
    `<meta property="og:description" content="${echapper(p.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:locale" content="fr_FR" />`,
    ...p.jsonLd.map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`),
  ].join('\n    ');
  return modele
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta name="description"[^>]*>/, '')
    .replace(/<link rel="canonical"[^>]*>/, '')
    .replace(/<meta property="og:(title|description|url)"[^>]*>/g, '')
    .replace('</head>', `    ${tete}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${p.contenu}</div>`);
}

const pages = toutesLesPages();
const vus = new Set<string>();
for (const p of pages) {
  if (vus.has(p.chemin)) throw new Error(`Adresse en double : ${p.chemin}`);
  vus.add(p.chemin);
  const fichier = join(DIST, p.chemin, 'index.html');
  mkdirSync(dirname(fichier), { recursive: true });
  writeFileSync(fichier, html(p));
}

const aujourdhui = new Date().toISOString().slice(0, 10);
writeFileSync(join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${SITE}${p.chemin}</loc><lastmod>${aujourdhui}</lastmod></url>`).join('\n')}
</urlset>
`);

// Robots : tout est ouvert, moteurs de recherche et assistants (qui peuvent ainsi citer le site).
writeFileSync(join(DIST, 'robots.txt'), `User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

Sitemap: ${SITE}/sitemap.xml
`);

// llms.txt : résumé du site et de ses pages, lisible par les assistants.
const parType = (prefixe: string) => pages.filter((p) => p.chemin.startsWith(prefixe) && p.chemin !== prefixe);
writeFileSync(join(DIST, 'llms.txt'), `# Chope ton chargeur

> Guide indépendant, en français, pour choisir le chargeur compatible avec son téléphone ou son ordinateur portable : chargeur conseillé par le fabricant, meilleur rapport qualité/prix, vitesse de charge obtenue, câble et chargeurs sans fil. Uniquement des marques connues, en version prise française. Les liens vers les marchands sont des liens affiliés.

## Pages principales
- [Accueil](${SITE}/) : recherche par modèle de téléphone ou d'ordinateur
- [Guide](${SITE}/guide/) : watts, Power Delivery, PPS, câble 5 A, GaN, usure de la batterie
- [Ordinateurs portables](${SITE}/ordinateur/) : chargeur d'origine et chargeurs USB-C compatibles

## Téléphones
${parType('/chargeur/').map((p) => `- [${p.titre.replace(/ \| Chope ton chargeur$/, '')}](${SITE}${p.chemin})`).join('\n')}

## Ordinateurs
${parType('/ordinateur/').map((p) => `- [${p.titre.replace(/ \| Chope ton chargeur$/, '')}](${SITE}${p.chemin})`).join('\n')}
`);

console.log(`Référencement : ${pages.length} pages, sitemap.xml, robots.txt et llms.txt générés.`);
