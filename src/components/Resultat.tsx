import { useMemo, useState } from 'react';
import { lienMarchand } from '../moteur/affiliation';
import { proposer, proposerSansFiche } from '../moteur/compatibilite';
import { pourquoi } from '../moteur/explications';
import { conseilMarque } from '../moteur/marques';
import { estVerifie, type Appareil, type Chargeur, type Proposition, type Telephone, type Tri } from '../moteur/types';
import { Icone } from './Icone';
import styles from './Resultat.module.css';

const TRIS: { cle: Tri; libelle: string; sansFiche?: string }[] = [
  { cle: 'vitesse', libelle: 'Vitesse de charge', sansFiche: 'Conseillés' },
  { cle: 'puissance', libelle: 'Puissance' },
  { cle: 'prix', libelle: 'Prix' },
  { cle: 'fiabilite', libelle: 'Fiabilité' },
];
const FIABILITE = { 3: 'Chargeur du constructeur', 2: 'Grande marque' } as const;
const PROTOCOLES = { pd: 'Power Delivery', pps: 'PPS', proprietaire: 'Charge rapide de la marque' } as const;

/** Ce qu'il faut savoir sur la charge de ce téléphone, en une phrase sans jargon inutile. */
function explication(t: Telephone): string {
  if (t.protocole === 'pd') {
    return `Il lui faut un chargeur USB-C « Power Delivery » d’au moins ${t.puissanceMaxW} W. Un chargeur plus puissant ne pose aucun problème : le téléphone ne prend que ce dont il a besoin.`;
  }
  if (t.protocole === 'pps') {
    const sans = t.puissanceSansProtocoleW ? `la charge retombe à ${t.puissanceSansProtocoleW} W` : 'la charge est plus lente';
    return `Pour charger à ${t.puissanceMaxW} W, le chargeur doit gérer le « PPS » (une option du Power Delivery). Sans PPS, ${sans}, même avec un chargeur très puissant.`;
  }
  return `${t.marque} utilise sa propre charge rapide (${t.techno}) : seul un chargeur ${t.marque} donne les ${t.puissanceMaxW} W. Un chargeur USB-C classique fonctionne aussi, mais plus lentement.`;
}

function vitesse(p: Proposition, t: Telephone): string {
  if (p.puissanceObtenueW === null) return 'Charge plus lente';
  return p.maximale ? `${p.puissanceObtenueW} W : vitesse maximale` : `${p.puissanceObtenueW} W sur ${t.puissanceMaxW} W possibles`;
}

function Carte({ p, appareil, conseil }: { p: Proposition; appareil: Appareil; conseil: boolean }) {
  const c: Chargeur = p.chargeur;
  const details = [...(c.puissanceW ? [`${c.puissanceW} W`] : []), ...c.protocoles.map((x) => PROTOCOLES[x]), FIABILITE[c.fiabilite]].join(' · ');
  return (
    <li className={`${styles.carte} ${conseil ? styles.conseil : ''}`}>
      {conseil && <p className={styles.etiquette}>Notre conseil</p>}
      <div className={styles.enTete}>
        <div>
          <h3 className={styles.nom}>{c.nom}</h3>
          <p className={styles.marque}>{c.marque}</p>
        </div>
        <p className={styles.prix} aria-label={`Niveau de prix : ${c.budget} sur 3`} title="Niveau de prix indicatif">
          <span aria-hidden="true">{'€'.repeat(c.budget)}<span className={styles.prixVide}>{'€'.repeat(3 - c.budget)}</span></span>
        </p>
      </div>
      {estVerifie(appareil) && (
        <p className={`${styles.vitesse} ${p.maximale ? styles.maximale : ''}`}>
          {p.maximale && <Icone nom="coche" taille={18} />}{vitesse(p, appareil)}
        </p>
      )}
      <p className={styles.details}>{details}</p>
      {estVerifie(appareil) && <p className={styles.pourquoi}><strong>Pourquoi ?</strong> {pourquoi(appareil, p)}</p>}
      {c.note && <p className={styles.note}>{c.note}</p>}
      <a className={`btn ${styles.lien}`} href={lienMarchand(c.requete)} target="_blank" rel="sponsored nofollow noopener">
        Voir sur Amazon <Icone nom="externe" taille={18} /><span className="sr-only"> : {c.nom} (nouvel onglet, lien affilié)</span>
      </a>
    </li>
  );
}

function cableConseille(a: Appareil): { texte: string; requete: string } {
  if (!estVerifie(a)) {
    return a.marque === 'Apple'
      ? { texte: 'Côté câble : USB-C vers USB-C pour les iPhone récents (à partir de l’iPhone 15), USB-C vers Lightning pour les précédents. Regarde le port de ton téléphone.', requete: 'câble USB-C iPhone certifié' }
      : { texte: 'Côté câble : USB-C vers USB-C sur la plupart des téléphones récents. Si le tien a un ancien port micro-USB, garde son câble d’origine.', requete: 'câble USB-C vers USB-C 60W' };
  }
  if (a.port === 'lightning') {
    return { texte: 'Ton téléphone a un port Lightning : il te faut un câble USB-C vers Lightning (certifié « MFi » de préférence).', requete: 'câble USB-C vers Lightning certifié MFi' };
  }
  return a.cable5A
    ? { texte: `Pour atteindre ${a.puissanceMaxW} W, prends un câble USB-C vers USB-C « 5 A » : avec un câble ordinaire, la charge est bridée.`, requete: 'câble USB-C vers USB-C 5A 100W' }
    : { texte: 'Côté câble, un USB-C vers USB-C de bonne qualité suffit.', requete: 'câble USB-C vers USB-C 60W' };
}

/**
 * Fiche de charge d'un téléphone et chargeurs compatibles, triables. Sans fiche vérifiée : conseil général de la marque
 * et chargeurs polyvalents, sans annoncer de vitesse.
 */
export function Resultat({ appareil, chargeurs, onChanger }: { appareil: Appareil; chargeurs: Chargeur[]; onChanger: () => void }) {
  const [tri, setTri] = useState<Tri>('vitesse');
  const verifie = estVerifie(appareil);
  const propositions = useMemo(
    () => (estVerifie(appareil) ? proposer(appareil, chargeurs, tri) : proposerSansFiche(appareil, chargeurs, tri)),
    [appareil, chargeurs, tri],
  );
  const cable = cableConseille(appareil);

  return (
    <section className={styles.resultat} aria-labelledby="titre-telephone">
      <div className={styles.fiche}>
        <div className={styles.ficheTete}>
          <span className={styles.pastille}><Icone nom="telephone" taille={26} /></span>
          <div>
            <p className={styles.surtitre}>{appareil.marque}{appareil.annee ? ` · ${appareil.annee}` : ''}</p>
            <h2 id="titre-telephone" tabIndex={-1}>{appareil.modele}</h2>
          </div>
          <button type="button" className={`btn btn--contour ${styles.changer}`} onClick={onChanger}>Changer</button>
        </div>
        {verifie ? (
          <>
            <dl className={styles.specs}>
              <div><dt>Charge maximale</dt><dd>{appareil.puissanceMaxW} W</dd></div>
              <div><dt>Port</dt><dd>{appareil.port === 'lightning' ? 'Lightning' : 'USB-C'}</dd></div>
              <div><dt>Charge rapide</dt><dd>{appareil.protocole === 'proprietaire' ? appareil.techno : appareil.protocole === 'pps' ? 'Power Delivery + PPS' : 'Power Delivery'}</dd></div>
            </dl>
            <p>{explication(appareil)}</p>
          </>
        ) : (
          <>
            <p className={styles.sansFiche}>
              <strong>Fiche de charge pas encore vérifiée pour ce modèle.</strong> On ne t’annonce donc pas de vitesse : voici ce qui vaut pour la marque, et des chargeurs sûrs.
            </p>
            <p>{conseilMarque(appareil.marque)}</p>
            <p className={styles.astuce}>Pour connaître sa puissance exacte, cherche « charge » ou « W » sur la fiche technique du constructeur.</p>
          </>
        )}
      </div>

      <div className={styles.barre}>
        <h2 className={styles.titreListe}>{verifie ? 'Chargeurs compatibles' : 'Chargeurs polyvalents'}</h2>
        <div role="radiogroup" aria-label="Trier par" className={styles.tris}>
          {TRIS.map(({ cle, libelle, sansFiche }) => (
            <button key={cle} type="button" role="radio" aria-checked={tri === cle} className={styles.tri} onClick={() => setTri(cle)}>
              {verifie ? libelle : sansFiche ?? libelle}
            </button>
          ))}
        </div>
      </div>

      <ul className={styles.liste}>
        {propositions.map((p, i) => <Carte key={p.chargeur.id} p={p} appareil={appareil} conseil={tri === 'vitesse' && i === 0} />)}
      </ul>

      <p className={styles.cable}>
        <span className={styles.cableIcone}><Icone nom="cable" /></span>
        <span>{cable.texte} <a href={lienMarchand(cable.requete)} target="_blank" rel="sponsored nofollow noopener">Voir des câbles sur Amazon</a></span>
      </p>
    </section>
  );
}
