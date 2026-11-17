/** Protocole de charge rapide : USB Power Delivery, sa variante PPS, ou une technologie propre à la marque. */
export type Protocole = 'pd' | 'pps' | 'proprietaire';
export type Port = 'usb-c' | 'lightning';

/** Un téléphone du catalogue : son nom et ses références, sans données de charge (src/data/catalogue.json). */
export interface Appareil {
  id: string;
  marque: string;
  modele: string;
  annee?: number;
  /** Références de modèle annoncées par le navigateur (« SM-S921B », ou un début comme « SM-S921 »), pour la détection. */
  codes?: string[];
}

/** Un téléphone dont la fiche de charge est vérifiée (src/data/telephones.json). */
export interface Telephone extends Appareil {
  annee: number;
  port: Port;
  /** Puissance maximale acceptée en filaire, en watts (donnée du constructeur). */
  puissanceMaxW: number;
  /** Protocole nécessaire pour atteindre cette puissance. */
  protocole: Protocole;
  /** Puissance obtenue avec un chargeur USB-C sans ce protocole, si le constructeur la communique. */
  puissanceSansProtocoleW?: number;
  /** Nom de la charge rapide propre à la marque (protocole « proprietaire »). */
  techno?: string;
  /** La puissance maximale demande un PPS à 5 A, côté chargeur et côté câble (Samsung 45 W). */
  cable5A?: boolean;
  /**
   * Recharge sans fil : `false` si le téléphone ne l'a pas ; sinon sa norme (MagSafe : aimants Apple, Qi : standard
   * commun) et sa puissance maximale quand elle est sûre.
   */
  sansFil?: false | { norme: 'magsafe' | 'qi'; maxW?: number };
}

export const estVerifie = (a: Appareil): a is Telephone => 'puissanceMaxW' in a;

/** Dessin du produit (src/components/Illustration.tsx) et sa teinte. */
export type Forme = 'cube' | 'compact' | 'gan' | 'brique' | 'magsafe' | 'pad' | 'support' | 'cable';
export type Teinte = 'blanc' | 'noir' | 'gris';

/** Un chargeur conseillé (src/data/chargeurs.json), ou le chargeur d'origine d'une marque (créé par le moteur). */
export interface Chargeur {
  id: string;
  marque: string;
  nom: string;
  puissanceW: number;
  /** Puissance maximale en PPS, si le chargeur le prend en charge. */
  ppsMaxW?: number;
  /** PPS à 5 A : nécessaire aux téléphones `cable5A` pour dépasser 25 W. */
  pps5A?: boolean;
  protocoles: Protocole[];
  /** 3 : chargeur du constructeur ; 2 : grande marque d'accessoires. */
  fiabilite: 2 | 3;
  /** Niveau de prix indicatif, de 1 (le moins cher) à 3. Pas de prix affiché : ils changent sans cesse chez le marchand. */
  budget: 1 | 2 | 3;
  /** Recherche envoyée au marchand. */
  requete: string;
  note?: string;
  /** Chargeur d'origine de cette marque (charge rapide propriétaire). */
  origineDe?: string;
  forme?: Forme;
  teinte?: Teinte;
}

/** Un chargeur évalué pour un téléphone. */
export interface Proposition {
  chargeur: Chargeur;
  /** Puissance réellement obtenue avec ce téléphone ; `null` : vitesse non communiquée. */
  puissanceObtenueW: number | null;
  /** Le téléphone charge à sa vitesse maximale. */
  maximale: boolean;
}

export type Tri = 'vitesse' | 'puissance' | 'prix' | 'fiabilite';
