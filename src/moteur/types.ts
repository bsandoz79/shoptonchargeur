/** Protocole de charge rapide : USB Power Delivery, sa variante PPS, ou une technologie propre à la marque. */
export type Protocole = 'pd' | 'pps' | 'proprietaire';
export type Port = 'usb-c' | 'lightning';

/** Un téléphone et ses besoins de charge (src/data/telephones.json). */
export interface Telephone {
  id: string;
  marque: string;
  modele: string;
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
  /** Câble 5 A nécessaire pour la puissance maximale. */
  cable5A?: boolean;
  /** Débuts des références de modèle envoyées par le navigateur (ex. « SM-S921 »), pour la détection automatique. */
  codes?: string[];
}

/** Un chargeur conseillé (src/data/chargeurs.json), ou le chargeur d'origine d'une marque (créé par le moteur). */
export interface Chargeur {
  id: string;
  marque: string;
  nom: string;
  puissanceW: number;
  /** Puissance maximale en PPS, si le chargeur le prend en charge. */
  ppsMaxW?: number;
  protocoles: Protocole[];
  /** 3 : chargeur du constructeur ; 2 : marque reconnue ; 1 : autre. */
  fiabilite: 1 | 2 | 3;
  /** Niveau de prix indicatif, de 1 (le moins cher) à 3. Pas de prix affiché : ils changent sans cesse chez le marchand. */
  budget: 1 | 2 | 3;
  /** Recherche envoyée au marchand. */
  requete: string;
  /** Famille de chargeurs (plusieurs marques) plutôt qu'un produit précis. */
  generique?: boolean;
  note?: string;
  /** Chargeur d'origine de cette marque (charge rapide propriétaire). */
  origineDe?: string;
}

/** Un chargeur évalué pour un téléphone. */
export interface Proposition {
  chargeur: Chargeur;
  /** Puissance réellement obtenue avec ce téléphone ; `null` : charge plus lente, vitesse non communiquée. */
  puissanceObtenueW: number | null;
  /** Le téléphone charge à sa vitesse maximale. */
  maximale: boolean;
}

export type Tri = 'vitesse' | 'puissance' | 'prix' | 'fiabilite';
