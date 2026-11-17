/**
 * Contenu des pages générées à la construction du site, pour les moteurs de recherche et les assistants (qui, souvent,
 * n'exécutent pas JavaScript) : titre, description, réponse en texte et FAQ, données structurées. Les chiffres viennent
 * du même moteur que l'application : la page lue par un robot dit la même chose que celle vue par un visiteur.
 */
import { CHARGEURS, CHARGEURS_SANS_FIL, ORDINATEURS, TELEPHONES } from '../data';
import { ESSENTIELS, GUIDE, pourquoi } from '../moteur/explications';
import { besoinEffectif, enUsbC, LIBELLE_PRISE, type Ordinateur } from '../moteur/ordinateur';
import { proposer } from '../moteur/compatibilite';
import { nomComplet } from '../moteur/recherche';
import { proposerSansFil } from '../moteur/sansFil';
import { selectionner } from '../moteur/selection';
import type { Telephone } from '../moteur/types';
import { CHEMIN_GUIDE, SITE, cheminOrdinateur, cheminTelephone } from './adresses';

export interface Page {
  chemin: string;
  titre: string;
  description: string;
  /** Contenu HTML placé dans la page (remplacé par l'application une fois chargée). */
  contenu: string;
  /** Données structurées schema.org. */
  jsonLd: object[];
}

const NOM_SITE = 'Chope ton chargeur';
export const echapper = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const w = (n: number) => `${String(n).replace('.', ',')} W`;
const PROTOCOLE = { pd: 'USB-C Power Delivery', pps: 'USB-C Power Delivery avec PPS', proprietaire: 'charge rapide de la marque' } as const;

function faq(questions: { q: string; r: string }[]): object {
  return {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: questions.map(({ q, r }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: r } })),
  };
}

function filAriane(elements: { nom: string; chemin: string }[]): object {
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: elements.map((e, i) => ({ '@type': 'ListItem', position: i + 1, name: e.nom, item: SITE + e.chemin })),
  };
}

const faqHtml = (questions: { q: string; r: string }[]) =>
  `<h2>Questions fréquentes</h2>${questions.map(({ q, r }) => `<h3>${echapper(q)}</h3><p>${echapper(r)}</p>`).join('')}`;

/** Le câble à prendre avec ce téléphone. */
function cable(t: Telephone): string {
  if (t.port === 'lightning') return 'un câble USB-C vers Lightning certifié MFi';
  if (t.cable5A) return 'un câble USB-C 5 A (vendu 100 W), indispensable pour dépasser 25 W';
  return 'un câble USB-C vers USB-C classique (60 W)';
}

/** Page d'un téléphone à fiche vérifiée. */
export function pageTelephone(t: Telephone): Page {
  // Les gens cherchent « chargeur iPhone 15 », pas « chargeur Apple iPhone 15 ».
  const nom = t.marque === 'Apple' ? t.modele : nomComplet(t);
  const props = proposer(t, CHARGEURS);
  const s = selectionner(t.marque, props, (p) => ({
    id: p.chargeur.id, marque: p.chargeur.marque, fiabilite: p.chargeur.fiabilite, budget: p.chargeur.budget, puissanceW: p.chargeur.puissanceW,
    part: p.puissanceObtenueW === null ? 0 : p.puissanceObtenueW / t.puissanceMaxW, origine: p.chargeur.origineDe === t.marque,
  }));
  const conseil = s.constructeur;
  const qp = s.qualitePrix;
  const sansFil = proposerSansFil(t, CHARGEURS_SANS_FIL);
  // « Anker Nano 30 W » garde son nom ; « Adaptateur secteur USB-C 20 W » devient « Adaptateur secteur USB-C 20 W Apple ».
  const nomChargeur = (p?: (typeof props)[number]) => (p ? (p.chargeur.nom.startsWith(p.chargeur.marque) ? p.chargeur.nom : `${p.chargeur.nom} ${p.chargeur.marque}`) : '');
  const vitesse = (p: (typeof props)[number]) => (p.puissanceObtenueW === null ? 'charge plus lente' : `${w(p.puissanceObtenueW)}${p.maximale ? ', vitesse maximale' : ''}`);

  const reponse = `${nom} se recharge jusqu’à ${w(t.puissanceMaxW)} en ${PROTOCOLE[t.protocole]}${t.techno ? ` (${t.techno})` : ''}.`
    + (conseil ? ` Chargeur conseillé par ${t.marque} : ${nomChargeur(conseil)} (${vitesse(conseil)}).` : '')
    + (qp ? ` Meilleur rapport qualité/prix : ${nomChargeur(qp)} (${vitesse(qp)}).` : '')
    + ` Avec ${cable(t)}.`;

  const questions = [
    { q: `Quel chargeur pour ${nom} ?`, r: reponse },
    {
      q: `Quelle puissance de charge accepte ${nom} ?`,
      r: `Jusqu’à ${w(t.puissanceMaxW)} en filaire, en ${PROTOCOLE[t.protocole]}.`
        + (t.puissanceSansProtocoleW ? ` Sans PPS, la charge retombe à ${w(t.puissanceSansProtocoleW)}.` : '')
        + (t.protocole === 'proprietaire' ? ` Seul un chargeur ${t.marque} donne cette vitesse ; un chargeur USB-C classique charge plus lentement.` : ''),
    },
    {
      q: `Un chargeur plus puissant peut-il abîmer ${nom} ?`,
      r: `Non. ${nom} ne prend que ce dont il a besoin, ${w(t.puissanceMaxW)} au plus, même sur un chargeur de 65 W. Ce qui use la batterie, c’est surtout la chaleur : une charge très rapide tous les jours l’use un peu plus vite qu’une charge douce de 20 W ou moins.`,
    },
    {
      q: `${nom} se recharge-t-il sans fil ?`,
      r: !t.sansFil
        ? `Non, ${nom} se recharge seulement avec un câble.`
        : `Oui, en ${t.sansFil.norme === 'magsafe' ? 'MagSafe' : 'Qi'}${t.sansFil.maxW ? ` jusqu’à ${w(t.sansFil.maxW)}` : ''}.${sansFil[0] ? ` Chargeur sans fil conseillé : ${sansFil[0].chargeur.nom}.` : ''}`,
    },
    { q: `Quel câble prendre pour ${nom} ?`, r: `Prends ${cable(t)}. Un câble trop faible peut brider la charge sans que tu le remarques.` },
  ];

  const autres = props.filter((p) => p !== conseil && p !== qp).slice(0, 6);
  const ligne = (p: (typeof props)[number]) => `<li><strong>${echapper(nomChargeur(p))}</strong> : ${echapper(vitesse(p))}. ${echapper(pourquoi(t, p))}</li>`;
  const contenu = `<main><nav><a href="/">${NOM_SITE}</a> › <a href="/#telephones">Téléphones</a> › ${echapper(nom)}</nav>`
    + `<h1>Quel chargeur pour ${echapper(nom)} ?</h1><p>${echapper(reponse)}</p>`
    + `<h2>À acheter en priorité</h2><ul>${[conseil, qp].filter((p): p is (typeof props)[number] => !!p).map(ligne).join('')}</ul>`
    + (autres.length ? `<h2>Autres chargeurs compatibles</h2><ul>${autres.map(ligne).join('')}</ul>` : '')
    + (sansFil.length ? `<h2>Chargeurs sans fil</h2><ul>${sansFil.map((p) => `<li><strong>${echapper(p.chargeur.nom)}</strong>${p.puissanceObtenueW ? ` : ${w(p.puissanceObtenueW)}` : ''}. ${echapper(p.pourquoi)}</li>`).join('')}</ul>` : '')
    + faqHtml(questions) + `<p><a href="${CHEMIN_GUIDE}">Comment marche un chargeur : le guide</a></p></main>`;

  const titre = `Chargeur ${nom} : lequel choisir (${w(t.puissanceMaxW)}) | ${NOM_SITE}`;
  const description = `${nom} charge jusqu’à ${w(t.puissanceMaxW)}. Chargeur conseillé par ${t.marque}${conseil ? ` (${nomChargeur(conseil)})` : ''}, meilleur rapport qualité/prix, câble et sans fil, en prise française.`;
  return {
    chemin: cheminTelephone(t.id), titre, description: description.slice(0, 300), contenu,
    jsonLd: [faq(questions), filAriane([{ nom: NOM_SITE, chemin: '/' }, { nom: 'Téléphones', chemin: '/#telephones' }, { nom, chemin: cheminTelephone(t.id) }])],
  };
}

/** Page d'un ordinateur ou d'une série d'ordinateurs. */
export function pageOrdinateur(o: Ordinateur): Page {
  const nom = o.marque === 'PC portable' || o.nom.startsWith(o.marque) ? o.nom : `${o.marque} ${o.nom}`;
  const puissance = o.etiquette ? 'la puissance écrite sur l’étiquette de son chargeur d’origine' : o.plageW ? `${w(o.plageW[0])} à ${w(o.plageW[1])} selon la version` : w(o.besoinW);
  const usbc = enUsbC(o);
  const reponse = usbc
    ? `${nom} se recharge en USB-C Power Delivery avec un chargeur d’au moins ${w(besoinEffectif(o))}${o.plageW ? ' (le haut de la plage, pour être tranquille quelle que soit la version)' : ''}.`
      + (o.chargeurOrigine ? ` Le chargeur d’origine conseillé par ${o.marque} est le ${o.chargeurOrigine.nom}.` : '')
      + (o.rapideW ? ` La recharge rapide s’active à partir de ${w(o.rapideW)}.` : '')
      + ' Un chargeur USB-C de grande marque plus puissant fonctionne aussi, sans risque.'
    : `${nom} se recharge par une prise ${LIBELLE_PRISE[o.prise ?? 'usb-c'].toLowerCase()}, pas en USB-C. Il faut le chargeur de la marque avec le même embout et au moins ${puissance}.`
      + (o.chargeurOrigine ? ` Chargeur conseillé : ${o.chargeurOrigine.nom}.` : '');
  const questions = [
    { q: `Quel chargeur pour ${nom} ?`, r: reponse },
    { q: `Quelle puissance de chargeur pour ${nom} ?`, r: `Son chargeur d’origine fait ${puissance}. Plus puissant ne pose aucun problème ; moins puissant, il charge lentement et peut se décharger en plein travail.` },
    { q: `Peut-on charger ${nom} avec un chargeur USB-C ?`, r: usbc ? `Oui, avec un chargeur USB-C Power Delivery d’au moins ${w(besoinEffectif(o))} et un câble adapté (5 A au-delà de 60 W, 240 W au-delà de 100 W).` : 'Non : sa prise de recharge n’est pas en USB-C. Garde un chargeur de la marque avec le bon embout.' },
    ...(o.note ? [{ q: `À quoi faire attention pour ${nom} ?`, r: o.note }] : []),
  ];
  const contenu = `<main><nav><a href="/">${NOM_SITE}</a> › <a href="/ordinateur/">Ordinateurs</a> › ${echapper(nom)}</nav>`
    + `<h1>Quel chargeur pour ${echapper(nom)} ?</h1><p>${echapper(reponse)}</p>` + faqHtml(questions) + '</main>';
  return {
    chemin: cheminOrdinateur(o.id),
    titre: `Chargeur ${nom} : quelle puissance, quel embout | ${NOM_SITE}`,
    description: `${nom} : chargeur d’origine (${puissance}), prise ${LIBELLE_PRISE[o.prise ?? 'usb-c']}, et chargeurs compatibles de grande marque en prise française.`.slice(0, 300),
    contenu,
    jsonLd: [faq(questions), filAriane([{ nom: NOM_SITE, chemin: '/' }, { nom: 'Ordinateurs', chemin: '/ordinateur/' }, { nom, chemin: cheminOrdinateur(o.id) }])],
  };
}

/** Liens vers toutes les fiches, par marque : pour l'accueil et la page des ordinateurs. */
function listeLiens(): string {
  const marques = [...new Set(TELEPHONES.map((t) => t.marque))];
  const telephones = marques.map((m) => `<h3>${echapper(m)}</h3><ul>${TELEPHONES.filter((t) => t.marque === m)
    .map((t) => `<li><a href="${cheminTelephone(t.id)}">Chargeur ${echapper(nomComplet(t))}</a></li>`).join('')}</ul>`).join('');
  const ordis = ORDINATEURS.filter((o) => !o.generique)
    .map((o) => `<li><a href="${cheminOrdinateur(o.id)}">Chargeur ${echapper(o.marque === 'Apple' ? o.nom : `${o.marque} ${o.nom}`)}</a></li>`).join('');
  return `<h2 id="telephones">Chargeurs par téléphone</h2>${telephones}<h2>Chargeurs par ordinateur portable</h2><ul>${ordis}</ul>`;
}

export function pageAccueil(): Page {
  const intro = 'Indique ton téléphone ou ton ordinateur portable : on te montre le chargeur conseillé par la marque, le meilleur rapport qualité/prix, la vitesse de charge réelle, le câble qui va avec et les chargeurs sans fil. Uniquement des marques connues, en prise française.';
  return {
    chemin: '/',
    titre: 'Chope ton chargeur : quel chargeur pour ton téléphone ou ton ordinateur ?',
    description: 'Trouve le bon chargeur pour ton téléphone ou ton PC portable : chargeur conseillé par la marque, meilleur rapport qualité/prix, câble, sans fil. iPhone, Samsung, Pixel, MacBook…',
    contenu: `<main><h1>Quel chargeur pour ton téléphone ?</h1><p>${echapper(intro)}</p><p><a href="${CHEMIN_GUIDE}">Le guide : watts, Power Delivery, PPS, câble, batterie</a></p>${listeLiens()}</main>`,
    jsonLd: [{
      '@context': 'https://schema.org', '@type': 'WebSite', name: NOM_SITE, url: `${SITE}/`, inLanguage: 'fr-FR',
      description: 'Guide indépendant pour choisir le chargeur compatible avec son téléphone ou son ordinateur portable.',
    }],
  };
}

export function pageOrdinateurs(): Page {
  const ordis = ORDINATEURS.filter((o) => !o.generique);
  return {
    chemin: '/ordinateur/',
    titre: `Chargeur d’ordinateur portable : lequel pour ton PC ou ton Mac | ${NOM_SITE}`,
    description: 'Chargeur d’origine et chargeurs USB-C compatibles pour MacBook, ThinkPad, XPS, EliteBook, Vivobook, Surface… Puissance, embout et câble.',
    contenu: `<main><h1>Quel chargeur pour ton ordinateur portable ?</h1><p>Choisis ton modèle : on t’indique la puissance et l’embout du chargeur d’origine, et les chargeurs USB-C compatibles quand ton ordinateur se recharge en USB-C.</p><ul>${ordis.map((o) => `<li><a href="${cheminOrdinateur(o.id)}">${echapper(o.marque === 'Apple' ? o.nom : `${o.marque} ${o.nom}`)}</a></li>`).join('')}</ul></main>`,
    jsonLd: [filAriane([{ nom: NOM_SITE, chemin: '/' }, { nom: 'Ordinateurs', chemin: '/ordinateur/' }])],
  };
}

export function pageGuide(): Page {
  const questions = GUIDE.map(({ question, reponse }) => ({ q: question, r: reponse }));
  return {
    chemin: CHEMIN_GUIDE,
    titre: `Comment marche un chargeur : watts, PD, PPS, câble et batterie | ${NOM_SITE}`,
    description: 'Watts, Power Delivery, PPS, charge rapide propre aux marques, câble 5 A, GaN, usure de la batterie : tout pour choisir un chargeur sans se tromper.',
    contenu: `<main><h1>Comment marche un chargeur ?</h1>${ESSENTIELS.map((e) => `<h2>${echapper(e.titre)}</h2><ul>${e.points.map((p) => `<li>${echapper(p)}</li>`).join('')}</ul>`).join('')}${faqHtml(questions)}</main>`,
    jsonLd: [faq(questions)],
  };
}

/** Toutes les pages générées. */
export function toutesLesPages(): Page[] {
  return [pageAccueil(), pageGuide(), pageOrdinateurs(), ...TELEPHONES.map(pageTelephone), ...ORDINATEURS.filter((o) => !o.generique).map(pageOrdinateur)];
}
