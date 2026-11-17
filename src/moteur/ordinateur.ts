import type { Chargeur, Tri } from './types';

/** Prise de recharge d'un ordinateur. */
export type PriseOrdinateur = 'usb-c' | 'ronde' | 'rectangulaire' | 'surface';

/** Un ordinateur portable ou une série d'ordinateurs (src/data/ordinateurs.json). */
export interface Ordinateur {
  id: string;
  marque: string;
  nom: string;
  /** Puissance du chargeur fourni : le minimum pour recharger normalement. */
  besoinW: number;
  /** Puissances du chargeur d'origine selon la configuration (série dont les modèles diffèrent). */
  plageW?: [number, number];
  /** Puissance trop variable pour être annoncée : lire l'étiquette du chargeur d'origine. */
  etiquette?: boolean;
  /** Prise de recharge ; absente : USB-C (choix par puissance). */
  prise?: PriseOrdinateur;
  /** Se recharge aussi par MagSafe (câble USB-C vers MagSafe 3 sur les mêmes blocs). */
  magsafe?: boolean;
  /** Chargeur d'origine conseillé par le fabricant (recherche chez le marchand). */
  chargeurOrigine?: { nom: string; requete: string };
  note?: string;
  /** Puissance à partir de laquelle la recharge rapide s'active, si l'ordinateur en a une. */
  rapideW?: number;
  /** Choix par la puissance lue sur le chargeur d'origine, plutôt qu'un modèle précis. */
  generique?: boolean;
  /** Année du modèle le plus récent de la gamme, pour ranger la recherche. */
  annee?: number;
}

/** Un chargeur d'ordinateur : `ports` > 1 = puissance partagée quand plusieurs appareils sont branchés. */
export type ChargeurOrdinateur = Chargeur & { ports?: number };

export type Niveau = 'rapide' | 'normal' | 'insuffisant';

export interface PropositionOrdinateur { chargeur: ChargeurOrdinateur; niveau: Niveau }

/** Puissance à fournir : le haut de la plage si elle varie (plus puissant ne pose aucun problème). */
export const besoinEffectif = (o: Ordinateur) => (o.plageW ? o.plageW[1] : o.besoinW);
export const enUsbC = (o: Ordinateur) => (o.prise ?? 'usb-c') === 'usb-c';
export const LIBELLE_PRISE: Record<PriseOrdinateur, string> = {
  'usb-c': 'USB-C', ronde: 'Ronde (embout)', rectangulaire: 'Rectangulaire', surface: 'Surface Connect',
};

/** Ce que ce chargeur permet à cet ordinateur. */
export function niveau(ordinateur: Ordinateur, chargeur: Chargeur): Niveau {
  if (chargeur.puissanceW < besoinEffectif(ordinateur)) return 'insuffisant';
  return ordinateur.rapideW && chargeur.puissanceW >= ordinateur.rapideW ? 'rapide' : 'normal';
}

const RANG: Record<Niveau, number> = { rapide: 0, normal: 1, insuffisant: 2 };

/**
 * Chargeurs pour un ordinateur, triés. Par défaut (« vitesse ») : ceux qui suffisent d'abord, le moins surdimensionné
 * en tête ; les chargeurs trop faibles en dernier. Le chargeur d'un constructeur n'est proposé que pour ses ordinateurs.
 */
export function proposerOrdinateur(ordinateur: Ordinateur, chargeurs: ChargeurOrdinateur[], tri: Tri = 'vitesse'): PropositionOrdinateur[] {
  const defaut = (a: PropositionOrdinateur, b: PropositionOrdinateur) =>
    RANG[a.niveau] - RANG[b.niveau]
    || (a.niveau === 'insuffisant' ? b.chargeur.puissanceW - a.chargeur.puissanceW : a.chargeur.puissanceW - b.chargeur.puissanceW)
    || b.chargeur.fiabilite - a.chargeur.fiabilite;
  const tris: Record<Tri, (a: PropositionOrdinateur, b: PropositionOrdinateur) => number> = {
    vitesse: defaut,
    puissance: (a, b) => b.chargeur.puissanceW - a.chargeur.puissanceW,
    prix: (a, b) => a.chargeur.budget - b.chargeur.budget,
    fiabilite: (a, b) => b.chargeur.fiabilite - a.chargeur.fiabilite,
  };
  return chargeurs
    .filter((c) => c.marque !== 'Apple' || ordinateur.marque === 'Apple')
    .map((chargeur) => ({ chargeur, niveau: niveau(ordinateur, chargeur) }))
    .sort((a, b) => tris[tri](a, b) || defaut(a, b));
}

/** Pourquoi ce chargeur convient (ou non) à cet ordinateur. */
export function pourquoiOrdinateur(o: Ordinateur, p: PropositionOrdinateur): string {
  const c = p.chargeur;
  const partage = c.ports && c.ports > 1
    ? ` Ses ${c.puissanceW} W, c’est pour un seul appareil. Si tu en branches plusieurs, la puissance se partage.`
    : '';
  if (p.niveau === 'insuffisant') {
    return `Il ne donne que ${c.puissanceW} W et ton ordinateur en demande ${besoinEffectif(o)}. Il charge quand même, lentement, et si tu travailles en même temps la batterie peut continuer à baisser.`;
  }
  if (p.niveau === 'rapide') {
    return `Avec ${c.puissanceW} W, il dépasse les ${o.rapideW} W nécessaires à la recharge rapide.${partage}`;
  }
  const reste = o.rapideW ? ` Pour la recharge rapide, il faudrait ${o.rapideW} W.` : '';
  const marge = c.puissanceW > o.besoinW ? ' Les watts en trop ne l’abîment pas, il ne prend que ce qu’il lui faut.' : '';
  return `Il donne ${c.puissanceW} W, au moins autant que les ${besoinEffectif(o)} W du chargeur d’origine. Ton ordinateur charge normalement, même pendant que tu t’en sers.${reste}${marge}${partage}`;
}
