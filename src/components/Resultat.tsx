import { useMemo, useState } from 'react';
import { CHARGEURS_SANS_FIL, TELEPHONES } from '../data';
import { proposer, proposerSansFiche } from '../moteur/compatibilite';
import { evaluer } from '../moteur/evaluation';
import { conseilMarque } from '../moteur/marques';
import { modelesProches } from '../moteur/proches';
import { nomComplet } from '../moteur/recherche';
import { proposerSansFil } from '../moteur/sansFil';
import { cheminTelephone } from '../seo/adresses';
import { selectionner, type Candidat, type Selection } from '../moteur/selection';
import { estVerifie, type Appareil, type Chargeur, type Proposition, type Telephone, type Tri } from '../moteur/types';
import { Icone } from './Icone';
import { CableConseille, LegendeNotes, Produit, type ProduitAffiche } from './Produit';
import styles from './Resultat.module.css';

const TRIS: { cle: Tri; libelle: string }[] = [
  { cle: 'vitesse', libelle: 'Recommandés' },
  { cle: 'prix', libelle: 'Prix' },
  { cle: 'puissance', libelle: 'Puissance' },
  { cle: 'fiabilite', libelle: 'Fiabilité' },
];

/** Ce qu'il faut savoir sur la charge de ce téléphone, en une phrase. */
function explication(t: Telephone): string {
  if (t.protocole === 'pd') {
    return `Il lui faut un chargeur USB-C Power Delivery d’au moins ${t.puissanceMaxW} W. Plus puissant, ça ne pose aucun problème, il ne prendra que ce dont il a besoin.`;
  }
  if (t.protocole === 'pps') {
    const sans = t.puissanceSansProtocoleW ? `la charge retombe à ${t.puissanceSansProtocoleW} W` : 'la charge est plus lente';
    return `Pour charger à ${t.puissanceMaxW} W, le chargeur doit avoir le PPS, une option du Power Delivery. Sans PPS, ${sans}, même avec un gros chargeur.`;
  }
  return `${t.marque} a sa propre charge rapide (${t.techno}). Seul un chargeur ${t.marque} donne les ${t.puissanceMaxW} W, un chargeur USB-C classique marche aussi mais moins vite.`;
}

/** Le câble qui va avec ce chargeur sur ce téléphone : le bloc seul ne suffit pas. */
function cablePour(a: Appareil, c: Chargeur): { nom: string; requete: string; longueurs: number[] } {
  if (estVerifie(a) && a.port === 'lightning') return { nom: 'Câble USB-C vers Lightning certifié MFi', requete: 'câble USB-C vers Lightning certifié MFi Apple', longueurs: [1, 2] };
  if (estVerifie(a) && a.cable5A && c.pps5A) return { nom: 'Câble USB-C 5 A (100 W)', requete: 'câble USB-C vers USB-C 5A 100W', longueurs: [1, 2] };
  return { nom: 'Câble USB-C vers USB-C 60 W', requete: 'câble USB-C vers USB-C 60W tressé', longueurs: [1, 2, 3] };
}

/** Un produit à afficher, avec ce qu'il faut pour le classer par priorité d'achat. */
type Ligne = { produit: ProduitAffiche; candidat: Candidat };

function produitFilaire(a: Appareil, p: Proposition): Ligne {
  const c = p.chargeur;
  const verifie = estVerifie(a);
  const verdict = !verifie ? undefined
    : p.puissanceObtenueW === null ? { texte: 'Charge plus lente', ok: false }
      : p.maximale ? { texte: `${p.puissanceObtenueW} W, vitesse maximale`, ok: true }
        : { texte: `${p.puissanceObtenueW} W sur ${a.puissanceMaxW} W possibles`, ok: false };
  const part = verifie ? (p.puissanceObtenueW === null ? 0 : p.puissanceObtenueW / a.puissanceMaxW) : null;
  const produit: ProduitAffiche = {
    id: c.id, marque: c.marque, nom: c.nom, forme: c.forme ?? 'cube', teinte: c.teinte ?? (c.marque === 'Samsung' ? 'noir' : 'blanc'), budget: c.budget,
    verdict,
    evaluation: evaluer(part, c.fiabilite, c.budget),
    requete: c.requete,
    asin: c.asin,
    cable: cablePour(a, c),
  };
  return { produit, candidat: { id: c.id, marque: c.marque, fiabilite: c.fiabilite, budget: c.budget, puissanceW: c.puissanceW, part, origine: c.origineDe === a.marque } };
}

/** Priorités d'achat : produits mis en avant (étiquetés), puis les autres. */
function priorites(a: Appareil, lignes: Ligne[]): Selection<ProduitAffiche> {
  const s = selectionner(a.marque, lignes, (l) => l.candidat);
  return {
    constructeur: s.constructeur && {
      ...s.constructeur.produit, vedette: 'constructeur',
      etiquette: estVerifie(a) ? `Conseillé par ${a.marque}` : `Le chargeur de la marque ${a.marque}`,
    },
    qualitePrix: s.qualitePrix && { ...s.qualitePrix.produit, vedette: 'qualitePrix', etiquette: 'Meilleur rapport qualité/prix' },
    autres: s.autres.map((l) => l.produit),
  };
}

/** Les produits à acheter en priorité, puis les autres compatibles. */
function Rayon({ selection, titreAutres, tri, onTri }: { selection: Selection<ProduitAffiche>; titreAutres: string; tri?: Tri; onTri?: (t: Tri) => void }) {
  const vedettes = [selection.constructeur, selection.qualitePrix].filter((p): p is ProduitAffiche => !!p);
  // Le câble du chargeur conseillé : le même pour presque toute la liste, affiché une seule fois.
  const avecCable = [...vedettes, ...selection.autres].find((p) => p.cable);
  return (
    <>
      <LegendeNotes />
      {vedettes.length > 0 && (
        <section className={styles.priorite} aria-labelledby="titre-priorite">
          <h3 id="titre-priorite" className={styles.titreSection}>À acheter en priorité</h3>
          <ul className={styles.vedettes}>{vedettes.map((p) => <Produit key={p.id} p={p} />)}</ul>
          {avecCable?.cable && <CableConseille cable={avecCable.cable} teinte={avecCable.teinte} />}
        </section>
      )}
      {vedettes.length === 0 && avecCable?.cable && <CableConseille cable={avecCable.cable} teinte={avecCable.teinte} />}
      {selection.autres.length > 0 && (
        <section aria-labelledby="titre-autres">
          <div className={styles.enteteAutres}>
            <h3 id="titre-autres" className={styles.titreSection}>{titreAutres}</h3>
            {tri && onTri && (
              <label className={styles.tri}>
                <span>Trier</span>
                <select value={tri} onChange={(e) => onTri(e.target.value as Tri)}>
                  {TRIS.map(({ cle, libelle }) => <option key={cle} value={cle}>{libelle}</option>)}
                </select>
              </label>
            )}
          </div>
          <ul className={styles.grille}>{selection.autres.map((p) => <Produit key={p.id} p={p} />)}</ul>
        </section>
      )}
    </>
  );
}

/**
 * Fiche de charge d'un téléphone et produits conseillés : chargeur secteur (bloc + câble) ou sans fil. Sans fiche
 * vérifiée : conseil général de la marque et chargeurs polyvalents, sans annoncer de vitesse.
 */
export function Resultat({ appareil, chargeurs, onChanger, onChoisir }: {
  appareil: Appareil; chargeurs: Chargeur[]; onChanger: () => void;
  /** Toucher un modèle proche : on affiche ses chargeurs. */
  onChoisir?: (t: Telephone) => void;
}) {
  const [tri, setTri] = useState<Tri>('vitesse');
  const [onglet, setOnglet] = useState<'secteur' | 'sansfil'>('secteur');
  const filaires = useMemo(
    () => priorites(appareil, (estVerifie(appareil) ? proposer(appareil, chargeurs, tri) : proposerSansFiche(appareil, chargeurs, tri)).map((p) => produitFilaire(appareil, p))),
    [appareil, chargeurs, tri],
  );
  const produitsSansFil = useMemo((): Selection<ProduitAffiche> => {
    if (!estVerifie(appareil) || !appareil.sansFil) return { autres: [] };
    const max = appareil.sansFil.maxW;
    return priorites(appareil, proposerSansFil(appareil, CHARGEURS_SANS_FIL).map((p): Ligne => {
      const c = p.chargeur;
      const w = p.puissanceObtenueW;
      const part = max && w !== null ? w / max : null;
      const produit: ProduitAffiche = {
        id: c.id, marque: c.marque, nom: c.nom, forme: c.forme, teinte: c.teinte, budget: c.budget,
        verdict: w === null ? undefined : { texte: max && w >= max ? `${String(w).replace('.', ',')} W, vitesse maximale sans fil` : `${String(w).replace('.', ',')} W sans fil`, ok: !!max && w >= max },
        evaluation: evaluer(part, c.fiabilite, c.budget),
        note: c.note ?? (c.adaptateurW ? `Le bloc secteur est vendu à part. Prends un USB-C de ${c.adaptateurW} W minimum.` : undefined),
        requete: c.requete,
        asin: c.asin,
      };
      return { produit, candidat: { id: c.id, marque: c.marque, fiabilite: c.fiabilite, budget: c.budget, puissanceW: c.puissanceW, part } };
    }));
  }, [appareil]);
  const compte = (s: Selection<ProduitAffiche>) => s.autres.length + (s.constructeur ? 1 : 0) + (s.qualitePrix ? 1 : 0);
  const nbSecteur = compte(filaires);
  const nbSansFil = compte(produitsSansFil);

  const verifie = estVerifie(appareil);
  const sf = verifie ? appareil.sansFil : undefined;
  const proches = verifie ? modelesProches(appareil, TELEPHONES) : [];

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
              <strong>On n’a pas encore vérifié la fiche de ce modèle.</strong> Pas de vitesse annoncée, donc, mais voici ce qui vaut pour la marque et des chargeurs sûrs.
            </p>
            <p className={styles.explication}>{conseilMarque(appareil.marque)}</p>
          </>
        )}
      </div>

      <div className={styles.barre}>
        <div className={styles.onglets} role="tablist" aria-label="Type de chargeur">
          <button type="button" role="tab" id="onglet-secteur" aria-controls="panneau-produits" aria-selected={onglet === 'secteur'} className={styles.onglet} onClick={() => setOnglet('secteur')}>
            Chargeur secteur <span className={styles.compte}>{nbSecteur}</span>
          </button>
          <button type="button" role="tab" id="onglet-sansfil" aria-controls="panneau-produits" aria-selected={onglet === 'sansfil'} className={styles.onglet} onClick={() => setOnglet('sansfil')}>
            Sans fil <span className={styles.compte}>{nbSansFil}</span>
          </button>
        </div>
      </div>

      <div id="panneau-produits" role="tabpanel" aria-labelledby={onglet === 'secteur' ? 'onglet-secteur' : 'onglet-sansfil'}>
        {onglet === 'secteur' ? (
          <>
            <p className={styles.chapo}>La couleur dit si le chargeur va au mieux avec ton téléphone. Pense aussi au câble : le mauvais peut brider la charge.</p>
            <Rayon selection={filaires} titreAutres="Les autres chargeurs compatibles" tri={tri} onTri={setTri} />
          </>
        ) : nbSansFil > 0 ? (
          <>
            <p className={styles.chapo}>Moins rapide qu’un câble, et le téléphone chauffe plus qu’avec un câble, mais bien pratique au bureau ou sur la table de nuit. Que des modèles de marques connues.</p>
            <Rayon selection={produitsSansFil} titreAutres="Les autres chargeurs sans fil compatibles" />
          </>
        ) : (
          <p className={styles.vide}>
            {sf === false
              ? 'Ce téléphone ne se recharge pas sans fil, seulement avec un câble.'
              : 'On ne sait pas encore si ce téléphone se recharge sans fil. Regarde si Qi est mentionné dans sa fiche technique. Si oui, un chargeur Qi de marque connue fera l’affaire.'}
          </p>
        )}
      </div>

      {proches.length > 0 && (
        <nav className={styles.proches} aria-labelledby="titre-proches">
          <h3 id="titre-proches" className={styles.titreSection}>Modèles proches</h3>
          <ul>
            {proches.map((t) => (
              <li key={t.id}>
                <a href={cheminTelephone(t.id)} onClick={(e) => { if (!onChoisir) return; e.preventDefault(); onChoisir(t); }}>
                  {t.marque === 'Apple' ? t.modele : nomComplet(t)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </section>
  );
}
