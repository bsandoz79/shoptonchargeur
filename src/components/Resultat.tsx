import { useMemo, useState } from 'react';
import { CHARGEURS_SANS_FIL } from '../data';
import { proposer, proposerSansFiche } from '../moteur/compatibilite';
import { pourquoi } from '../moteur/explications';
import { conseilMarque } from '../moteur/marques';
import { qualitePrix } from '../moteur/qualitePrix';
import { proposerSansFil } from '../moteur/sansFil';
import { estVerifie, type Appareil, type Chargeur, type Proposition, type Telephone, type Tri } from '../moteur/types';
import { Icone } from './Icone';
import { Produit, type ProduitAffiche } from './Produit';
import styles from './Resultat.module.css';

const TRIS: { cle: Tri; libelle: string }[] = [
  { cle: 'vitesse', libelle: 'Recommandés' },
  { cle: 'prix', libelle: 'Prix' },
  { cle: 'puissance', libelle: 'Puissance' },
  { cle: 'fiabilite', libelle: 'Fiabilité' },
];
const PROTOCOLES = { pd: 'Power Delivery', pps: 'PPS', proprietaire: 'Charge de la marque' } as const;

/** Ce qu'il faut savoir sur la charge de ce téléphone, en une phrase. */
function explication(t: Telephone): string {
  if (t.protocole === 'pd') {
    return `Il lui faut un chargeur USB-C « Power Delivery » d’au moins ${t.puissanceMaxW} W. Plus puissant ne pose aucun problème : le téléphone ne prend que ce dont il a besoin.`;
  }
  if (t.protocole === 'pps') {
    const sans = t.puissanceSansProtocoleW ? `la charge retombe à ${t.puissanceSansProtocoleW} W` : 'la charge est plus lente';
    return `Pour charger à ${t.puissanceMaxW} W, le chargeur doit gérer le « PPS » (une option du Power Delivery). Sans PPS, ${sans}, même avec un chargeur très puissant.`;
  }
  return `${t.marque} utilise sa propre charge rapide (${t.techno}) : seul un chargeur ${t.marque} donne les ${t.puissanceMaxW} W. Un chargeur USB-C classique fonctionne aussi, plus lentement.`;
}

/** Le câble qui va avec ce chargeur sur ce téléphone : le bloc seul ne suffit pas. */
function cablePour(a: Appareil, c: Chargeur): { nom: string; requete: string } {
  if (estVerifie(a) && a.port === 'lightning') return { nom: 'Câble USB-C vers Lightning certifié MFi', requete: 'câble USB-C vers Lightning certifié MFi Apple' };
  if (estVerifie(a) && a.cable5A && c.pps5A) return { nom: 'Câble USB-C 5 A (100 W)', requete: 'câble USB-C vers USB-C 5A 100W' };
  return { nom: 'Câble USB-C vers USB-C 60 W', requete: 'câble USB-C vers USB-C 60W tressé' };
}

function produitFilaire(a: Appareil, p: Proposition, i: number, tri: Tri): ProduitAffiche {
  const c = p.chargeur;
  const verifie = estVerifie(a);
  const verdict = !verifie ? undefined
    : p.puissanceObtenueW === null ? { texte: 'Charge plus lente', ok: false }
      : p.maximale ? { texte: `${p.puissanceObtenueW} W, vitesse maximale`, ok: true }
        : { texte: `${p.puissanceObtenueW} W sur ${a.puissanceMaxW} W possibles`, ok: false };
  const part = verifie ? (p.puissanceObtenueW === null ? 0 : p.puissanceObtenueW / a.puissanceMaxW) : null;
  return {
    id: c.id, marque: c.marque, nom: c.nom, forme: c.forme ?? 'cube', teinte: c.teinte ?? (c.marque === 'Samsung' ? 'noir' : 'blanc'), budget: c.budget,
    etiquette: tri === 'vitesse' && i === 0 ? 'Notre choix' : undefined,
    verdict,
    qualitePrix: qualitePrix(part, c.fiabilite, c.budget),
    caracteristiques: [...(c.puissanceW ? [`${c.puissanceW} W`] : []), ...c.protocoles.map((x) => PROTOCOLES[x]), c.fiabilite === 3 ? 'Constructeur' : 'Grande marque'],
    pourquoi: verifie ? pourquoi(a, p) : undefined,
    note: c.note,
    requete: c.requete,
    cable: cablePour(a, c),
  };
}

/**
 * Fiche de charge d'un téléphone et produits conseillés : chargeur secteur (bloc + câble) ou sans fil. Sans fiche
 * vérifiée : conseil général de la marque et chargeurs polyvalents, sans annoncer de vitesse.
 */
export function Resultat({ appareil, chargeurs, onChanger }: { appareil: Appareil; chargeurs: Chargeur[]; onChanger: () => void }) {
  const [tri, setTri] = useState<Tri>('vitesse');
  const [onglet, setOnglet] = useState<'secteur' | 'sansfil'>('secteur');
  const filaires = useMemo(
    () => (estVerifie(appareil) ? proposer(appareil, chargeurs, tri) : proposerSansFiche(appareil, chargeurs, tri)).map((p, i) => produitFilaire(appareil, p, i, tri)),
    [appareil, chargeurs, tri],
  );
  const produitsSansFil = useMemo((): ProduitAffiche[] => {
    if (!estVerifie(appareil) || !appareil.sansFil) return [];
    const max = appareil.sansFil.maxW;
    return proposerSansFil(appareil, CHARGEURS_SANS_FIL).map((p, i) => {
      const c = p.chargeur;
      const w = p.puissanceObtenueW;
      return {
        id: c.id, marque: c.marque, nom: c.nom, forme: c.forme, teinte: c.teinte, budget: c.budget,
        etiquette: i === 0 ? 'Notre choix' : undefined,
        verdict: w === null ? undefined : { texte: max && w >= max ? `${String(w).replace('.', ',')} W, vitesse maximale sans fil` : `${String(w).replace('.', ',')} W sans fil`, ok: !!max && w >= max },
        qualitePrix: qualitePrix(max && w !== null ? w / max : null, c.fiabilite, c.budget),
        caracteristiques: [`${c.puissanceW} W`, c.norme === 'magsafe' ? 'MagSafe' : c.norme === 'qi2' ? 'Qi2 magnétique' : 'Qi', c.fiabilite === 3 ? 'Constructeur' : 'Grande marque'],
        pourquoi: p.pourquoi,
        note: c.note ?? (c.adaptateurW ? `Bloc secteur vendu à part : prends un USB-C de ${c.adaptateurW} W ou plus.` : undefined),
        requete: c.requete,
      };
    });
  }, [appareil]);

  const verifie = estVerifie(appareil);
  const sf = verifie ? appareil.sansFil : undefined;

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
        {estVerifie(appareil) ? (
          <>
            <dl className={styles.specs}>
              <div><dt>Charge filaire max.</dt><dd>{appareil.puissanceMaxW} W</dd></div>
              <div><dt>Port</dt><dd>{appareil.port === 'lightning' ? 'Lightning' : 'USB-C'}</dd></div>
              <div><dt>Charge rapide</dt><dd>{appareil.protocole === 'proprietaire' ? appareil.techno : appareil.protocole === 'pps' ? 'PD + PPS' : 'Power Delivery'}</dd></div>
              <div><dt>Sans fil</dt><dd>{sf ? `${sf.norme === 'magsafe' ? 'MagSafe' : 'Qi'}${sf.maxW ? `, ${String(sf.maxW).replace('.', ',')} W` : ''}` : sf === false ? 'Non' : '—'}</dd></div>
            </dl>
            <p className={styles.explication}>{explication(appareil)}</p>
          </>
        ) : (
          <>
            <p className={styles.sansFiche}>
              <strong>Fiche de charge pas encore vérifiée pour ce modèle.</strong> On ne t’annonce donc pas de vitesse : voici ce qui vaut pour la marque, et des chargeurs sûrs.
            </p>
            <p className={styles.explication}>{conseilMarque(appareil.marque)}</p>
          </>
        )}
      </div>

      <div className={styles.barre}>
        <div className={styles.onglets} role="tablist" aria-label="Type de chargeur">
          <button type="button" role="tab" id="onglet-secteur" aria-controls="panneau-produits" aria-selected={onglet === 'secteur'} className={styles.onglet} onClick={() => setOnglet('secteur')}>
            Chargeur secteur <span className={styles.compte}>{filaires.length}</span>
          </button>
          <button type="button" role="tab" id="onglet-sansfil" aria-controls="panneau-produits" aria-selected={onglet === 'sansfil'} className={styles.onglet} onClick={() => setOnglet('sansfil')}>
            Sans fil <span className={styles.compte}>{produitsSansFil.length}</span>
          </button>
        </div>
        {onglet === 'secteur' && (
          <label className={styles.tri}>
            <span>Trier</span>
            <select value={tri} onChange={(e) => setTri(e.target.value as Tri)}>
              {TRIS.map(({ cle, libelle }) => <option key={cle} value={cle}>{libelle}</option>)}
            </select>
          </label>
        )}
      </div>

      <div id="panneau-produits" role="tabpanel" aria-labelledby={onglet === 'secteur' ? 'onglet-secteur' : 'onglet-sansfil'}>
        {onglet === 'secteur' ? (
          <>
            <p className={styles.chapo}>Le bloc seul ne suffit pas : on t’indique sous chacun le câble qui va avec, pour ne pas brider la charge.</p>
            <ul className={styles.grille}>{filaires.map((p) => <Produit key={p.id} p={p} />)}</ul>
          </>
        ) : produitsSansFil.length > 0 ? (
          <>
            <p className={styles.chapo}>Plus lent qu’un câble, mais pratique au bureau ou la nuit : tu poses le téléphone, il charge. Seulement des modèles de constructeurs et de grandes marques.</p>
            <ul className={styles.grille}>{produitsSansFil.map((p) => <Produit key={p.id} p={p} />)}</ul>
          </>
        ) : (
          <p className={styles.vide}>
            {sf === false
              ? 'Ce téléphone n’a pas la recharge sans fil : il se recharge seulement par câble.'
              : 'On ne sait pas encore si ce téléphone a la recharge sans fil. Cherche « Qi » ou « recharge sans fil » sur sa fiche technique : si c’est le cas, un chargeur Qi de grande marque convient.'}
          </p>
        )}
      </div>
    </section>
  );
}
