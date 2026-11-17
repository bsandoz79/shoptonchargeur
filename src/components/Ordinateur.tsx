import { useMemo, useState } from 'react';
import { pourquoiOrdinateur, proposerOrdinateur, type ChargeurOrdinateur, type Niveau, type Ordinateur as Ordi } from '../moteur/ordinateur';
import type { Tri } from '../moteur/types';
import { qualitePrix } from '../moteur/qualitePrix';
import { Icone } from './Icone';
import { Produit, type ProduitAffiche } from './Produit';
import styles from './Resultat.module.css';
import propres from './Ordinateur.module.css';

const TRIS: { cle: Tri; libelle: string }[] = [
  { cle: 'vitesse', libelle: 'Recommandés' },
  { cle: 'puissance', libelle: 'Puissance' },
  { cle: 'prix', libelle: 'Prix' },
  { cle: 'fiabilite', libelle: 'Fiabilité' },
];
const NIVEAUX: Record<Niveau, string> = { rapide: 'Recharge rapide', normal: 'Recharge normale', insuffisant: 'Trop faible : recharge lente' };

/** Choix de l'ordinateur : par la puissance lue sur le chargeur d'origine, ou parmi les MacBook. */
export function ChoixOrdinateur({ ordinateurs, onChoisir }: { ordinateurs: Ordi[]; onChoisir: (o: Ordi) => void }) {
  const groupes = [
    { titre: 'PC portable : quelle puissance est écrite sur ton chargeur d’origine ?', liste: ordinateurs.filter((o) => o.generique), libelle: (o: Ordi) => `${o.besoinW === 100 ? '90 ou 100' : o.besoinW} W` },
    { titre: 'Mac', liste: ordinateurs.filter((o) => !o.generique), libelle: (o: Ordi) => o.nom },
  ];
  return (
    <div className={propres.choix}>
      <p className={propres.condition}>
        Ça concerne les ordinateurs qui se rechargent en <strong>USB-C</strong>, la petite prise ovale qu’on trouve aussi sur les téléphones. Si le tien a une prise ronde ou spéciale, garde le chargeur de la marque.
      </p>
      {groupes.map(({ titre, liste, libelle }) => (
        <div key={titre} className={propres.groupe}>
          <p className={propres.groupeTitre}>{titre}</p>
          <div className={propres.puces}>
            {liste.map((o) => <button key={o.id} type="button" className={propres.puce} onClick={() => onChoisir(o)}>{libelle(o)}</button>)}
          </div>
        </div>
      ))}
      <p className={propres.astuce}>La puissance est écrite en petit sur le bloc, après Output ou Sortie. Par exemple 65 W, ou 20 V 3,25 A, ce qui revient au même.</p>
    </div>
  );
}

/** Chargeurs pour un ordinateur portable, avec l'explication de chaque verdict. */
export function ResultatOrdinateur({ ordinateur, chargeurs, onChanger }: { ordinateur: Ordi; chargeurs: ChargeurOrdinateur[]; onChanger: () => void }) {
  const [tri, setTri] = useState<Tri>('vitesse');
  const propositions = useMemo(() => proposerOrdinateur(ordinateur, chargeurs, tri), [ordinateur, chargeurs, tri]);
  const cable = ordinateur.besoinW > 100
    ? { nom: 'Câble USB-C 240 W', requete: 'câble USB-C vers USB-C 240W', longueurs: [1, 2] }
    : ordinateur.besoinW > 60
      ? { nom: 'Câble USB-C 5 A (100 W)', requete: 'câble USB-C vers USB-C 100W 5A', longueurs: [1, 2] }
      : { nom: 'Câble USB-C 60 W', requete: 'câble USB-C vers USB-C 60W tressé', longueurs: [1, 2, 3] };
  const produits: ProduitAffiche[] = propositions.map((p, i) => {
    const c = p.chargeur;
    return {
      id: c.id, marque: c.marque, nom: c.nom, forme: c.forme ?? 'brique', teinte: c.teinte ?? 'blanc', budget: c.budget,
      etiquette: tri === 'vitesse' && i === 0 && p.niveau !== 'insuffisant' ? 'Notre choix' : undefined,
      verdict: { texte: NIVEAUX[p.niveau], ok: p.niveau !== 'insuffisant' },
      qualitePrix: qualitePrix(p.niveau === 'insuffisant' ? c.puissanceW / ordinateur.besoinW : 1, c.fiabilite, c.budget),
      caracteristiques: [`${c.puissanceW} W`, 'Power Delivery', ...(c.ports && c.ports > 1 ? [`${c.ports} ports`] : []), c.fiabilite === 3 ? 'Constructeur' : 'Grande marque', ...(c.prise === 'fr' ? ['Prise française'] : [])],
      pourquoi: pourquoiOrdinateur(ordinateur, p),
      requete: c.requete,
      asin: c.asin,
      cable: p.niveau === 'insuffisant' ? undefined : cable,
    };
  });

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
          <div><dt>Recharge rapide</dt><dd>{ordinateur.rapideW ? `dès ${ordinateur.rapideW} W` : '—'}</dd></div>
          <div><dt>Câble</dt><dd>{cable.nom.replace('Câble USB-C ', '')}</dd></div>
        </dl>
        <p className={styles.explication}>
          Un ordinateur charge en USB-C Power Delivery, comme un téléphone, mais il demande bien plus de puissance. Prends au moins {ordinateur.besoinW} W, comme le chargeur d’origine. Plus, ça ne pose aucun problème. Moins, il chargera lentement.
        </p>
      </div>

      <div className={styles.barre}>
        <h2 className={styles.titreListe}>Chargeurs compatibles</h2>
        <label className={styles.tri}>
          <span>Trier</span>
          <select value={tri} onChange={(e) => setTri(e.target.value as Tri)}>
            {TRIS.map(({ cle, libelle }) => <option key={cle} value={cle}>{libelle}</option>)}
          </select>
        </label>
      </div>
      <ul className={styles.grille}>{produits.map((p) => <Produit key={p.id} p={p} />)}</ul>
    </section>
  );
}
