import type { MouseEvent } from 'react';
import { lienAmazon, lienMarchand } from '../moteur/affiliation';
import { EVALUATIONS, type Evaluation } from '../moteur/evaluation';
import type { Forme, Teinte } from '../moteur/types';
import { Icone } from './Icone';
import { Illustration } from './Illustration';
import styles from './Produit.module.css';

export interface ProduitAffiche {
  id: string;
  marque: string;
  nom: string;
  forme?: Forme;
  teinte?: Teinte;
  budget: 1 | 2 | 3;
  /** Étiquette de la carte (« Conseillé par Apple »). */
  etiquette?: string;
  /** Produit mis en avant (carte plus grande, en tête) : chargeur du constructeur ou meilleur rapport qualité/prix. */
  vedette?: 'constructeur' | 'qualitePrix';
  /** Note en couleur pour l'appareil choisi. */
  evaluation?: Evaluation;
  /** Vitesse obtenue, en une ligne (« 45 W, vitesse maximale »). Absent : rien n'est annoncé. */
  verdict?: { texte: string; ok: boolean };
  /** Mise en garde indispensable (bloc secteur vendu à part…). */
  note?: string;
  requete: string;
  /** Identifiant Amazon du produit (ASIN) : le lien mène directement à sa page, sinon à une recherche. */
  asin?: string;
  /** Câble à associer : affiché une fois pour la liste (bloc `CableConseille`), pas sur chaque carte. */
  cable?: Cable;
}

export type Cable = { nom: string; requete: string; longueurs?: number[] };

/** Page du produit si son identifiant Amazon est connu, sinon une recherche. */
const lienProduit = (p: { asin?: string; requete: string }) => (p.asin ? lienAmazon(p.asin) : lienMarchand(p.requete));

const PRIX = { 1: 'Petit prix', 2: 'Prix moyen', 3: 'Haut de gamme' } as const;

/** Pastille de note : un point de couleur et le niveau. */
export function PastilleNote({ e }: { e: Evaluation }) {
  return (
    <span className={`${styles.note} ${styles[e]}`}>
      <span className={styles.point} aria-hidden="true" />
      {EVALUATIONS[e].libelle}
    </span>
  );
}

/** Ce que veut dire chaque couleur, une fois au-dessus des cartes. */
export function LegendeNotes() {
  return (
    <ul className={styles.legende} aria-label="Ce que veulent dire les notes">
      {(Object.keys(EVALUATIONS) as Evaluation[]).map((e) => (
        <li key={e}><PastilleNote e={e} /><span className={styles.legendeSens}>{EVALUATIONS[e].sens}</span></li>
      ))}
    </ul>
  );
}

/** Le câble qui va avec les chargeurs de la liste, proposé en plusieurs longueurs. */
export function CableConseille({ cable, teinte = 'blanc' }: { cable: Cable; teinte?: Teinte }) {
  return (
    <div className={styles.cable}>
      <a className={styles.cableLien} href={lienMarchand(cable.requete)} target="_blank" rel="sponsored nofollow noopener">
        <Illustration forme="cable" teinte={teinte === 'noir' ? 'noir' : 'blanc'} taille={52} />
        <span><span className={styles.cableLibelle}>À associer</span>{cable.nom}</span>
      </a>
      {cable.longueurs && (
        <p className={styles.longueurs}>
          <span>Longueur :</span>
          {cable.longueurs.map((l) => (
            <a key={l} href={lienMarchand(`${cable.requete} ${l}m`)} target="_blank" rel="sponsored nofollow noopener"
              aria-label={`${cable.nom}, ${l} mètre${l > 1 ? 's' : ''} (lien affilié)`}>{l} m</a>
          ))}
        </p>
      )}
    </div>
  );
}

/** Toucher la carte ailleurs que sur un lien ouvre la page du produit, comme le bouton. */
function ouvrir(e: MouseEvent<HTMLLIElement>) {
  if ((e.target as Element).closest('a, button, summary')) return;
  e.currentTarget.querySelector<HTMLAnchorElement>('a[data-produit]')?.click();
}

/** Carte produit : dessin, marque, nom, note en couleur et bouton. Toute la carte mène au produit. */
export function Produit({ p }: { p: ProduitAffiche }) {
  return (
    <li data-apparait onClick={ouvrir}
      className={[styles.carte, p.vedette ? styles.vedette : '', p.vedette === 'qualitePrix' ? styles.vedetteQp : ''].join(' ').trim()}>
      {p.vedette && p.etiquette && (
        <p className={styles.bandeau}><Icone nom={p.vedette === 'constructeur' ? 'eclair' : 'coche'} taille={16} />{p.etiquette}</p>
      )}
      <div className={styles.visuel}>
        {!p.vedette && p.etiquette && <span className={styles.etiquette}>{p.etiquette}</span>}
        <Illustration forme={p.forme} teinte={p.teinte} taille={p.vedette ? 190 : 150} />
      </div>
      <div className={styles.corps}>
        <p className={styles.marque}>
          {p.marque}
          <span className={styles.prix} aria-label={`${PRIX[p.budget]} (niveau ${p.budget} sur 3)`} title={PRIX[p.budget]}>
            <span aria-hidden="true">{'€'.repeat(p.budget)}<span className={styles.prixVide}>{'€'.repeat(3 - p.budget)}</span></span>
          </span>
        </p>
        <h3 className={styles.nom}>{p.nom}</h3>
        {(p.evaluation || p.verdict) && (
          <div className={styles.evaluation}>
            {p.evaluation && <PastilleNote e={p.evaluation} />}
            {p.verdict && <span className={styles.verdict}>{p.verdict.texte}</span>}
          </div>
        )}
        {p.note && <p className={styles.alerte}>{p.note}</p>}
        <a data-produit className={`btn ${styles.acheter}`} href={lienProduit(p)} target="_blank" rel="sponsored nofollow noopener">
          Voir le prix <Icone nom="externe" taille={17} /><span className="sr-only"> de {p.nom} sur Amazon (nouvel onglet, lien affilié)</span>
        </a>
      </div>
    </li>
  );
}
