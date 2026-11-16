import type { Chargeur, Tri } from './types';

/** Un ordinateur portable qui se recharge en USB-C (src/data/ordinateurs.json). */
export interface Ordinateur {
  id: string;
  marque: string;
  nom: string;
  /** Puissance du chargeur fourni : le minimum pour recharger normalement. */
  besoinW: number;
  /** Puissance à partir de laquelle la recharge rapide s'active, si l'ordinateur en a une. */
  rapideW?: number;
  /** Choix par la puissance lue sur le chargeur d'origine, plutôt qu'un modèle précis. */
  generique?: boolean;
}

/** Un chargeur d'ordinateur : `ports` > 1 = puissance partagée quand plusieurs appareils sont branchés. */
export type ChargeurOrdinateur = Chargeur & { ports?: number };

export type Niveau = 'rapide' | 'normal' | 'insuffisant';

export interface PropositionOrdinateur { chargeur: ChargeurOrdinateur; niveau: Niveau }

/** Ce que ce chargeur permet à cet ordinateur. */
export function niveau(ordinateur: Ordinateur, chargeur: Chargeur): Niveau {
  if (chargeur.puissanceW < ordinateur.besoinW) return 'insuffisant';
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
    ? ` Attention : ses ${c.puissanceW} W valent pour un seul appareil branché. Avec plusieurs appareils, la puissance se partage.`
    : '';
  if (p.niveau === 'insuffisant') {
    return `Il ne fournit que ${c.puissanceW} W alors que ton ordinateur en demande ${o.besoinW}. Il le recharge quand même, en USB-C « Power Delivery », mais lentement : en plein travail, la batterie peut continuer à baisser.`;
  }
  if (p.niveau === 'rapide') {
    return `Avec ${c.puissanceW} W, il atteint les ${o.rapideW} W qui déclenchent la recharge rapide de ton ordinateur.${partage}`;
  }
  const reste = o.rapideW ? ` Pour la recharge rapide, il faudrait ${o.rapideW} W.` : '';
  const marge = c.puissanceW > o.besoinW ? ' L’ordinateur ne prend que ce qu’il lui faut : la puissance en plus ne l’abîme pas.' : '';
  return `Il fournit ${c.puissanceW} W en USB-C « Power Delivery », au moins les ${o.besoinW} W du chargeur d’origine : ton ordinateur se recharge normalement, même en l’utilisant.${reste}${marge}${partage}`;
}
