import { lienMarchand } from '../moteur/affiliation';
import { EXPLICATION_QUALITE_PRIX, type Verdict } from '../moteur/qualitePrix';
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
  /** Étiquette en haut de la carte (« Notre choix »). */
  etiquette?: string;
  /** Vitesse ou verdict sur l'appareil choisi ; `ok` : coche verte. Absent : rien n'est annoncé. */
  verdict?: { texte: string; ok: boolean };
  qualitePrix?: Verdict;
  caracteristiques: string[];
  pourquoi?: string;
  note?: string;
  requete: string;
  /** Câble à associer (le bloc seul ne suffit pas). */
  cable?: { nom: string; requete: string };
}

const PRIX = { 1: 'Petit prix', 2: 'Prix moyen', 3: 'Haut de gamme' } as const;
const CLASSE_QP: Record<Verdict, string | undefined> = { Excellent: styles.qpExcellent, 'Très bon': styles.qpTresbon, Bon: undefined, Moyen: styles.qpMoyen };

/** Carte produit : dessin, marque, nom, verdict sur l'appareil, rapport qualité/prix, et le câble qui va avec. */
export function Produit({ p }: { p: ProduitAffiche }) {
  return (
    <li className={`${styles.carte} ${p.etiquette ? styles.choix : ''}`}>
      <div className={styles.visuel}>
        {p.etiquette && <span className={styles.etiquette}>{p.etiquette}</span>}
        <Illustration forme={p.forme} teinte={p.teinte} />
      </div>
      <div className={styles.corps}>
        <p className={styles.marque}>{p.marque}</p>
        <h3 className={styles.nom}>{p.nom}</h3>
        {p.verdict && (
          <p className={`${styles.verdict} ${p.verdict.ok ? styles.ok : ''}`}>
            {p.verdict.ok && <Icone nom="coche" taille={17} />}{p.verdict.texte}
          </p>
        )}
        <ul className={styles.puces} aria-label="Caractéristiques">
          {p.caracteristiques.map((c) => <li key={c}>{c}</li>)}
        </ul>
        <div className={styles.indicateurs}>
          {p.qualitePrix && (
            <p className={styles.qp} title={EXPLICATION_QUALITE_PRIX}>
              <span className={styles.qpLibelle}>Qualité/prix</span>
              <span className={`${styles.qpValeur} ${CLASSE_QP[p.qualitePrix] ?? ''}`}>{p.qualitePrix}</span>
            </p>
          )}
          <p className={styles.prix} aria-label={`${PRIX[p.budget]} (niveau ${p.budget} sur 3)`}>
            <span aria-hidden="true">{'€'.repeat(p.budget)}<span className={styles.prixVide}>{'€'.repeat(3 - p.budget)}</span></span>
            <span className={styles.prixTexte}>{PRIX[p.budget]}</span>
          </p>
        </div>
        {p.pourquoi && (
          <details className={styles.pourquoi}>
            <summary>Pourquoi il convient</summary>
            <p>{p.pourquoi}</p>
          </details>
        )}
        {p.note && <p className={styles.note}>{p.note}</p>}
        <div className={styles.actions}>
          <a className={`btn ${styles.acheter}`} href={lienMarchand(p.requete)} target="_blank" rel="sponsored nofollow noopener">
            Voir le prix <Icone nom="externe" taille={17} /><span className="sr-only"> de {p.nom} sur Amazon (nouvel onglet, lien affilié)</span>
          </a>
          {p.cable && (
            <a className={styles.cable} href={lienMarchand(p.cable.requete)} target="_blank" rel="sponsored nofollow noopener">
              <Illustration forme="cable" teinte={p.teinte === 'noir' ? 'noir' : 'blanc'} taille={44} />
              <span><span className={styles.cableLibelle}>À associer</span>{p.cable.nom}</span>
            </a>
          )}
        </div>
      </div>
    </li>
  );
}
