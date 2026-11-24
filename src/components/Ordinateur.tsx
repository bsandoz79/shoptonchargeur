import { useMemo, useState } from 'react';
import { Recherche } from './Recherche';
import { LIBELLE_PRISE, besoinEffectif, enUsbC, proposerOrdinateur, type ChargeurOrdinateur, type Niveau, type Ordinateur as Ordi } from '../moteur/ordinateur';
import type { Tri } from '../moteur/types';
import type { Evaluation } from '../moteur/evaluation';
import { Icone } from './Icone';
import { CableConseille, LegendeNotes, Produit, type ProduitAffiche } from './Produit';
import styles from './Resultat.module.css';
import propres from './Ordinateur.module.css';

const TRIS: { cle: Tri; libelle: string }[] = [
  { cle: 'vitesse', libelle: 'Recommandés' },
  { cle: 'puissance', libelle: 'Puissance' },
  { cle: 'prix', libelle: 'Prix' },
  { cle: 'fiabilite', libelle: 'Fiabilité' },
];
const NIVEAUX: Record<Niveau, string> = { rapide: 'Recharge rapide', normal: 'Recharge normale', insuffisant: 'Trop faible : recharge lente' };
const EVALUATION_ORDI: Record<Niveau, Evaluation> = { rapide: 'ideal', normal: 'tresbon', insuffisant: 'lent' };

/** Choix de l'ordinateur : par son modèle (recherche ou raccourcis), ou par la puissance lue sur le chargeur d'origine. */
export function ChoixOrdinateur({ ordinateurs, onChoisir }: { ordinateurs: Ordi[]; onChoisir: (o: Ordi) => void }) {
  const [saisie, setSaisie] = useState('');
  const modeles = ordinateurs.filter((o) => !o.generique);
  // La recherche travaille sur des « appareils » (marque, modèle) : on y range les ordinateurs nommés.
  const appareils = useMemo(() => modeles.map((o) => ({ id: o.id, marque: o.marque, modele: o.nom, annee: o.annee })), [modeles]);
  const marques = [...new Set(modeles.map((o) => o.marque))];
  const groupes = [
    ...marques.map((m) => ({ titre: m, liste: modeles.filter((o) => o.marque === m), libelle: (o: Ordi) => o.nom })),
    { titre: 'Ton modèle n’y est pas ? Choisis la puissance écrite sur ton chargeur d’origine (USB-C)', liste: ordinateurs.filter((o) => o.generique), libelle: (o: Ordi) => `${o.besoinW === 100 ? '90 ou 100' : o.besoinW} W` },
  ];
  return (
    <div className={propres.choix}>
      <Recherche telephones={appareils} saisie={saisie} onSaisie={setSaisie}
        onChoisir={(a) => { const o = ordinateurs.find((x) => x.id === a.id); if (o) onChoisir(o); }}
        libelle="Quel ordinateur veux-tu recharger ?" exemple="Ex. macbook air, xps 13, thinkpad" nomListe="Ordinateurs trouvés"
        aideVide="Choisis plutôt ta marque ou la puissance écrite sur ton chargeur d’origine, juste en dessous." />
      <p className={propres.sousTitre}>Ou choisis ta marque</p>
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
  const usbc = enUsbC(ordinateur);
  const besoin = besoinEffectif(ordinateur);
  const propositions = useMemo(() => (usbc ? proposerOrdinateur(ordinateur, chargeurs, tri) : []), [ordinateur, chargeurs, tri, usbc]);
  const puissance = ordinateur.etiquette ? 'Voir l’étiquette' : ordinateur.plageW ? `${ordinateur.plageW[0]} à ${ordinateur.plageW[1]} W` : `${ordinateur.besoinW} W`;
  const origine: ProduitAffiche | undefined = ordinateur.chargeurOrigine && {
    id: `origine-${ordinateur.id}`, marque: ordinateur.marque, nom: ordinateur.chargeurOrigine.nom,
    forme: usbc ? 'cube' : 'brique', teinte: ordinateur.marque === 'Apple' || ordinateur.marque === 'Microsoft' ? 'blanc' : 'noir', budget: 3,
    etiquette: `Conseillé par ${ordinateur.marque}`, vedette: 'constructeur',
    evaluation: 'ideal',
    verdict: { texte: 'Chargeur d’origine', ok: true },
    note: usbc ? undefined
      : `Prise ${ordinateur.prise === 'surface' ? 'Surface Connect' : ordinateur.prise === 'ronde' ? 'ronde' : 'rectangulaire'}, pas USB-C : prends celui de la marque, même embout, au moins la même puissance.`,
    requete: ordinateur.chargeurOrigine.requete,
  };
  const cable = besoin > 100
    ? { nom: 'Câble USB-C 240 W', requete: 'câble USB-C vers USB-C 240W', longueurs: [1, 2] }
    : besoin > 60
      ? { nom: 'Câble USB-C 5 A (100 W)', requete: 'câble USB-C vers USB-C 100W 5A', longueurs: [1, 2] }
      : { nom: 'Câble USB-C 60 W', requete: 'câble USB-C vers USB-C 60W tressé', longueurs: [1, 2, 3] };
  const produits: ProduitAffiche[] = propositions.map((p, i) => {
    const c = p.chargeur;
    return {
      id: c.id, marque: c.marque, nom: c.nom, forme: c.forme ?? 'brique', teinte: c.teinte ?? 'blanc', budget: c.budget,
      etiquette: tri === 'vitesse' && i === 0 && p.niveau !== 'insuffisant' ? 'Notre choix USB-C' : undefined,
      evaluation: EVALUATION_ORDI[p.niveau],
      verdict: { texte: NIVEAUX[p.niveau], ok: p.niveau !== 'insuffisant' },
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
          <div><dt>Chargeur d’origine</dt><dd>{puissance}</dd></div>
          <div><dt>Prise</dt><dd>{LIBELLE_PRISE[ordinateur.prise ?? 'usb-c']}{ordinateur.magsafe ? ' ou MagSafe' : ''}</dd></div>
          <div><dt>Recharge rapide</dt><dd>{ordinateur.rapideW ? `dès ${ordinateur.rapideW} W` : '—'}</dd></div>
          <div><dt>Câble</dt><dd>{usbc ? cable.nom.replace('Câble USB-C ', '') : 'Fixé au chargeur'}</dd></div>
        </dl>
        <p className={styles.explication}>
          {usbc
            ? `Un ordinateur charge en USB-C Power Delivery, comme un téléphone, mais il demande bien plus de puissance. Prends au moins ${besoin} W${ordinateur.plageW ? ', le haut de la plage, pour être tranquille quelle que soit la version' : ', comme le chargeur d’origine'}. Plus, ça ne pose aucun problème. Moins, il chargera lentement.`
            : 'Avec une prise ronde ou rectangulaire, chaque marque a ses embouts et ses puissances. Le plus sûr est de reprendre le chargeur de la marque, avec le même embout et au moins les mêmes watts que l’original (c’est écrit sur son étiquette, après Output).'}
        </p>
        {ordinateur.note && <p className={styles.explication}>{ordinateur.note}</p>}
        {ordinateur.magsafe && <p className={styles.explication}>Il se recharge aussi par MagSafe : le câble USB-C vers MagSafe 3 d’Apple se branche sur les mêmes chargeurs.</p>}
      </div>

      {origine && (
        <section className={styles.priorite} aria-labelledby="titre-origine">
          <h3 id="titre-origine" className={styles.titreSection}>{usbc ? 'Le chargeur d’origine' : 'Le chargeur qu’il te faut'}</h3>
          <ul className={styles.vedettes}><Produit p={origine} /></ul>
        </section>
      )}

      {usbc && <div className={styles.barre}>
        <h2 className={styles.titreListe}>Chargeurs USB-C compatibles</h2>
        <label className={styles.tri}>
          <span>Trier</span>
          <select value={tri} onChange={(e) => setTri(e.target.value as Tri)}>
            {TRIS.map(({ cle, libelle }) => <option key={cle} value={cle}>{libelle}</option>)}
          </select>
        </label>
      </div>}
      {usbc && <LegendeNotes />}
      {usbc && <CableConseille cable={cable} />}
      {usbc && <ul className={styles.grille}>{produits.map((p) => <Produit key={p.id} p={p} />)}</ul>}
    </section>
  );
}
