import { useMemo, useState } from 'react';
import { lienMarchand } from '../moteur/affiliation';
import { proposer } from '../moteur/compatibilite';
import type { Chargeur, Proposition, Telephone, Tri } from '../moteur/types';
import { Icone } from './Icone';
import styles from './Resultat.module.css';

const TRIS: { cle: Tri; libelle: string }[] = [
  { cle: 'vitesse', libelle: 'Vitesse de charge' },
  { cle: 'puissance', libelle: 'Puissance' },
  { cle: 'prix', libelle: 'Prix' },
  { cle: 'fiabilite', libelle: 'Fiabilité' },
];
const FIABILITE = { 3: 'Chargeur du constructeur', 2: 'Marque reconnue', 1: 'Autre marque' } as const;
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

function Carte({ p, telephone, conseil }: { p: Proposition; telephone: Telephone; conseil: boolean }) {
  const c: Chargeur = p.chargeur;
  const details = [`${c.puissanceW} W`, ...c.protocoles.map((x) => PROTOCOLES[x])].join(' · ');
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
      <p className={`${styles.vitesse} ${p.maximale ? styles.maximale : ''}`}>
        {p.maximale && <Icone nom="coche" taille={18} />}{vitesse(p, telephone)}
      </p>
      <p className={styles.details}>{details} · {FIABILITE[c.fiabilite]}</p>
      {c.generique && telephone.protocole === 'pps' && (
        <p className={styles.note}>
          {telephone.cable5A
            ? `Avant d’acheter, vérifie que la fiche du produit annonce bien les ${telephone.puissanceMaxW} W pour ${telephone.marque} (« PPS » jusqu’à 5 A) : tous les chargeurs ${c.puissanceW} W ne le font pas.`
            : 'Avant d’acheter, vérifie que la fiche du produit mentionne bien « PPS ».'}
        </p>
      )}
      {c.note && <p className={styles.note}>{c.note}</p>}
      <a className={`btn ${styles.lien}`} href={lienMarchand(c.requete)} target="_blank" rel="sponsored nofollow noopener">
        Voir sur Amazon <Icone nom="externe" taille={18} /><span className="sr-only"> : {c.nom} (nouvel onglet, lien affilié)</span>
      </a>
    </li>
  );
}

/** Fiche de charge d'un téléphone et chargeurs compatibles, triables. */
export function Resultat({ telephone, chargeurs, onChanger }: { telephone: Telephone; chargeurs: Chargeur[]; onChanger: () => void }) {
  const [tri, setTri] = useState<Tri>('vitesse');
  const propositions = useMemo(() => proposer(telephone, chargeurs, tri), [telephone, chargeurs, tri]);
  const lightning = telephone.port === 'lightning';
  const cable = lightning
    ? { texte: 'Ton téléphone a un port Lightning : il te faut un câble USB-C vers Lightning (certifié « MFi » de préférence).', requete: 'câble USB-C vers Lightning certifié MFi' }
    : telephone.cable5A
      ? { texte: `Pour atteindre ${telephone.puissanceMaxW} W, prends un câble USB-C vers USB-C « 5 A » : avec un câble ordinaire, la charge est bridée.`, requete: 'câble USB-C vers USB-C 5A 100W' }
      : { texte: 'Côté câble, un USB-C vers USB-C de bonne qualité suffit.', requete: 'câble USB-C vers USB-C 60W' };

  return (
    <section className={styles.resultat} aria-labelledby="titre-telephone">
      <div className={styles.fiche}>
        <div className={styles.ficheTete}>
          <span className={styles.pastille}><Icone nom="telephone" taille={26} /></span>
          <div>
            <p className={styles.surtitre}>{telephone.marque} · {telephone.annee}</p>
            <h2 id="titre-telephone" tabIndex={-1}>{telephone.modele}</h2>
          </div>
          <button type="button" className={`btn btn--contour ${styles.changer}`} onClick={onChanger}>Changer</button>
        </div>
        <dl className={styles.specs}>
          <div><dt>Charge maximale</dt><dd>{telephone.puissanceMaxW} W</dd></div>
          <div><dt>Port</dt><dd>{lightning ? 'Lightning' : 'USB-C'}</dd></div>
          <div><dt>Charge rapide</dt><dd>{telephone.protocole === 'proprietaire' ? telephone.techno : telephone.protocole === 'pps' ? 'Power Delivery + PPS' : 'Power Delivery'}</dd></div>
        </dl>
        <p>{explication(telephone)}</p>
      </div>

      <div className={styles.barre}>
        <h2 className={styles.titreListe}>Chargeurs compatibles</h2>
        <div role="radiogroup" aria-label="Trier par" className={styles.tris}>
          {TRIS.map(({ cle, libelle }) => (
            <button key={cle} type="button" role="radio" aria-checked={tri === cle} className={styles.tri} onClick={() => setTri(cle)}>{libelle}</button>
          ))}
        </div>
      </div>

      <ul className={styles.liste}>
        {propositions.map((p, i) => <Carte key={p.chargeur.id} p={p} telephone={telephone} conseil={tri === 'vitesse' && i === 0} />)}
      </ul>

      <p className={styles.cable}>
        <span className={styles.cableIcone}><Icone nom="cable" /></span>
        <span>{cable.texte} <a href={lienMarchand(cable.requete)} target="_blank" rel="sponsored nofollow noopener">Voir des câbles sur Amazon</a></span>
      </p>
    </section>
  );
}
