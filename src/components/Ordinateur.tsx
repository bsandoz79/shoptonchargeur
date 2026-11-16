import { useMemo, useState } from 'react';
import { lienMarchand } from '../moteur/affiliation';
import { pourquoiOrdinateur, proposerOrdinateur, type ChargeurOrdinateur, type Niveau, type Ordinateur as Ordi } from '../moteur/ordinateur';
import type { Tri } from '../moteur/types';
import { Icone } from './Icone';
import styles from './Resultat.module.css';
import propres from './Ordinateur.module.css';

const TRIS: { cle: Tri; libelle: string }[] = [
  { cle: 'vitesse', libelle: 'Conseillés' },
  { cle: 'puissance', libelle: 'Puissance' },
  { cle: 'prix', libelle: 'Prix' },
  { cle: 'fiabilite', libelle: 'Fiabilité' },
];
const NIVEAUX: Record<Niveau, string> = { rapide: 'Recharge rapide', normal: 'Recharge normale', insuffisant: 'Trop faible : recharge lente' };
const FIABILITE = { 3: 'Chargeur du constructeur', 2: 'Grande marque' } as const;

/** Choix de l'ordinateur : par la puissance lue sur le chargeur d'origine, ou parmi les MacBook. */
export function ChoixOrdinateur({ ordinateurs, onChoisir }: { ordinateurs: Ordi[]; onChoisir: (o: Ordi) => void }) {
  const groupes = [
    { titre: 'PC portable : quelle puissance est écrite sur ton chargeur d’origine ?', liste: ordinateurs.filter((o) => o.generique), libelle: (o: Ordi) => `${o.besoinW === 100 ? '90 ou 100' : o.besoinW} W` },
    { titre: 'Mac', liste: ordinateurs.filter((o) => !o.generique), libelle: (o: Ordi) => o.nom },
  ];
  return (
    <div className={propres.choix}>
      <p className={propres.condition}>
        Ce guide vaut pour les ordinateurs qui se rechargent par un port <strong>USB-C</strong> (la prise ovale, comme sur les téléphones récents). Si ton chargeur a une prise ronde ou propre à la marque, il te faut le chargeur du constructeur.
      </p>
      {groupes.map(({ titre, liste, libelle }) => (
        <div key={titre} className={propres.groupe}>
          <p className={propres.groupeTitre}>{titre}</p>
          <div className={propres.puces}>
            {liste.map((o) => <button key={o.id} type="button" className={propres.puce} onClick={() => onChoisir(o)}>{libelle(o)}</button>)}
          </div>
        </div>
      ))}
      <p className={propres.astuce}>La puissance est écrite en petit sur le bloc du chargeur, après « Output » ou « Sortie » : par exemple « 20 V ⎓ 3,25 A » (soit 65 W) ou directement « 65 W ».</p>
    </div>
  );
}

/** Chargeurs pour un ordinateur portable, avec l'explication de chaque verdict. */
export function ResultatOrdinateur({ ordinateur, chargeurs, onChanger }: { ordinateur: Ordi; chargeurs: ChargeurOrdinateur[]; onChanger: () => void }) {
  const [tri, setTri] = useState<Tri>('vitesse');
  const propositions = useMemo(() => proposerOrdinateur(ordinateur, chargeurs, tri), [ordinateur, chargeurs, tri]);
  const cable = ordinateur.besoinW > 100
    ? { texte: 'Au-delà de 100 W, il faut un câble USB-C « 240 W » : un câble ordinaire bride la charge.', requete: 'câble USB-C vers USB-C 240W' }
    : ordinateur.besoinW > 60
      ? { texte: 'Au-delà de 60 W, il faut un câble USB-C « 5 A » (vendu « 100 W ») : un câble ordinaire bride la charge à 60 W.', requete: 'câble USB-C vers USB-C 100W 5A' }
      : { texte: 'Côté câble, un USB-C vers USB-C « 60 W » ou plus suffit.', requete: 'câble USB-C vers USB-C 100W 5A' };

  return (
    <section className={styles.resultat} aria-labelledby="titre-telephone">
      <div className={styles.fiche}>
        <div className={styles.ficheTete}>
          <span className={styles.pastille}><Icone nom="ordinateur" taille={26} /></span>
          <div>
            <p className={styles.surtitre}>{ordinateur.marque}</p>
            <h2 id="titre-telephone" tabIndex={-1}>{ordinateur.nom}</h2>
          </div>
          <button type="button" className={`btn btn--contour ${styles.changer}`} onClick={onChanger}>Changer</button>
        </div>
        <dl className={styles.specs}>
          <div><dt>Puissance à fournir</dt><dd>{ordinateur.besoinW} W</dd></div>
          <div><dt>Port</dt><dd>USB-C</dd></div>
          <div><dt>Recharge rapide</dt><dd>{ordinateur.rapideW ? `à partir de ${ordinateur.rapideW} W` : 'non renseignée'}</dd></div>
        </dl>
        <p>
          Un ordinateur se recharge en USB-C « Power Delivery », comme un téléphone, mais il lui faut bien plus de puissance. La règle : un chargeur d’au moins {ordinateur.besoinW} W, la puissance du chargeur d’origine. Plus puissant ne pose aucun problème ; moins puissant recharge lentement.
        </p>
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
        {propositions.map((p, i) => {
          const c = p.chargeur;
          const conseil = tri === 'vitesse' && i === 0 && p.niveau !== 'insuffisant';
          return (
            <li key={c.id} className={`${styles.carte} ${conseil ? styles.conseil : ''}`}>
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
              <p className={`${styles.vitesse} ${p.niveau === 'insuffisant' ? '' : styles.maximale}`}>
                {p.niveau !== 'insuffisant' && <Icone nom="coche" taille={18} />}{NIVEAUX[p.niveau]}
              </p>
              <p className={styles.details}>
                {[`${c.puissanceW} W`, 'Power Delivery', ...(c.ports && c.ports > 1 ? [`${c.ports} ports`] : []), FIABILITE[c.fiabilite]].join(' · ')}
              </p>
              <p className={styles.pourquoi}><strong>Pourquoi ?</strong> {pourquoiOrdinateur(ordinateur, p)}</p>
              <a className={`btn ${styles.lien}`} href={lienMarchand(c.requete)} target="_blank" rel="sponsored nofollow noopener">
                Voir sur Amazon <Icone nom="externe" taille={18} /><span className="sr-only"> : {c.nom} (nouvel onglet, lien affilié)</span>
              </a>
            </li>
          );
        })}
      </ul>

      <p className={styles.cable}>
        <span className={styles.cableIcone}><Icone nom="cable" /></span>
        <span>{cable.texte} <a href={lienMarchand(cable.requete)} target="_blank" rel="sponsored nofollow noopener">Voir des câbles sur Amazon</a></span>
      </p>
    </section>
  );
}
