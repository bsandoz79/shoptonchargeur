import { lienAmazon, lienMarchand } from '../moteur/affiliation';
import type { EffetBatterie } from '../moteur/batterie';
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
  /** Étiquette de la carte (« Conseillé par Apple »). */
  etiquette?: string;
  /** Produit mis en avant (carte plus grande, en tête) : chargeur du constructeur ou meilleur rapport qualité/prix. */
  vedette?: 'constructeur' | 'qualitePrix';
  /** Vitesse ou verdict sur l'appareil choisi ; `ok` : coche verte. Absent : rien n'est annoncé. */
  verdict?: { texte: string; ok: boolean };
  /** Effet de cette charge sur la batterie (vitesse contre durée de vie). */
  batterie?: EffetBatterie;
  qualitePrix?: Verdict;
  caracteristiques: string[];
  pourquoi?: string;
  note?: string;
  requete: string;
  /** Identifiant Amazon du produit (ASIN) : le lien mène directement à sa page, sinon à une recherche. */
  asin?: string;
  /** Câble à associer (le bloc seul ne suffit pas), proposé en plusieurs longueurs. */
  cable?: { nom: string; requete: string; longueurs?: number[] };
}

/** Page du produit si son identifiant Amazon est connu, sinon une recherche. */
const lienProduit = (p: { asin?: string; requete: string }) => (p.asin ? lienAmazon(p.asin) : lienMarchand(p.requete));

const NIVEAUX: { profil: EffetBatterie['profil']; libelle: string }[] = [
  { profil: 'tres-rapide', libelle: 'Très rapide' },
  { profil: 'rapide', libelle: 'Rapide' },
  { profil: 'douce', libelle: 'Doux' },
];

/** Échelle de vitesse de charge, du plus rapide au plus doux pour la batterie ; le niveau du produit est mis en valeur. */
function Niveau({ b }: { b: EffetBatterie }) {
  const actuel = NIVEAUX.find((n) => n.profil === b.profil)!;
  return (
    <div className={styles.niveau}>
      <p className={styles.niveauEchelle} role="img" aria-label={`Vitesse de charge : ${actuel.libelle.toLowerCase()} (échelle : très rapide, rapide, doux pour la batterie)`}>
        {NIVEAUX.map((n) => (
          <span key={n.profil} className={n.profil === b.profil ? styles.niveauActuel : undefined} aria-hidden="true">{n.libelle}</span>
        ))}
      </p>
      <p className={styles.niveauBornes} aria-hidden="true"><span>Plus vite</span><span>Batterie ménagée</span></p>
      <p className={styles.niveauTexte}>{b.texte}</p>
    </div>
  );
}

const PRIX = { 1: 'Petit prix', 2: 'Prix moyen', 3: 'Haut de gamme' } as const;
const CLASSE_QP: Record<Verdict, string | undefined> = { Excellent: styles.qpExcellent, 'Très bon': styles.qpTresbon, Bon: undefined, Moyen: styles.qpMoyen };

/** Carte produit : dessin, marque, nom, verdict sur l'appareil, rapport qualité/prix, et le câble qui va avec. */
export function Produit({ p }: { p: ProduitAffiche }) {
  return (
    <li data-apparait className={[styles.carte, p.vedette ? styles.vedette : '', p.vedette === 'qualitePrix' ? styles.vedetteQp : ''].join(' ').trim()}>
      {p.vedette && p.etiquette && (
        <p className={styles.bandeau}><Icone nom={p.vedette === 'constructeur' ? 'eclair' : 'coche'} taille={16} />{p.etiquette}</p>
      )}
      <div className={styles.visuel}>
        {!p.vedette && p.etiquette && <span className={styles.etiquette}>{p.etiquette}</span>}
        <Illustration forme={p.forme} teinte={p.teinte} taille={p.vedette ? 190 : 160} />
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
        {p.batterie && <Niveau b={p.batterie} />}
        {p.pourquoi && (
          <details className={styles.pourquoi}>
            <summary>Pourquoi il convient</summary>
            <p>{p.pourquoi}</p>
          </details>
        )}
        {p.note && <p className={styles.note}>{p.note}</p>}
        <div className={styles.actions}>
          <a className={`btn ${styles.acheter}`} href={lienProduit(p)} target="_blank" rel="sponsored nofollow noopener">
            Voir le prix <Icone nom="externe" taille={17} /><span className="sr-only"> de {p.nom} sur Amazon (nouvel onglet, lien affilié)</span>
          </a>
          {p.cable && (
            <div className={styles.cable}>
              <a className={styles.cableLien} href={lienMarchand(p.cable.requete)} target="_blank" rel="sponsored nofollow noopener">
                <Illustration forme="cable" teinte={p.teinte === 'noir' ? 'noir' : 'blanc'} taille={44} />
                <span><span className={styles.cableLibelle}>À associer</span>{p.cable.nom}</span>
              </a>
              {p.cable.longueurs && (
                <p className={styles.longueurs}>
                  <span>Longueur :</span>
                  {p.cable.longueurs.map((l) => (
                    <a key={l} href={lienMarchand(`${p.cable!.requete} ${l}m`)} target="_blank" rel="sponsored nofollow noopener"
                      aria-label={`${p.cable!.nom}, ${l} mètre${l > 1 ? 's' : ''} (lien affilié)`}>{l} m</a>
                  ))}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
