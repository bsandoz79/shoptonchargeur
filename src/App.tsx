import { useEffect, useMemo, useRef, useState } from 'react';
import { Icone } from './components/Icone';
import { Recherche } from './components/Recherche';
import { Resultat } from './components/Resultat';
import { CHARGEURS, TELEPHONES, chargerCatalogue } from './data';
import { detecter, type Detection } from './moteur/detection';
import { chercher, nomComplet } from './moteur/recherche';
import type { Appareil } from './moteur/types';
import styles from './App.module.css';

const MARQUES = ['Apple', 'Samsung', 'Google', 'Xiaomi', 'OnePlus', 'OPPO', 'HONOR', 'Motorola', 'realme', 'Nothing'];
const idDeLUrl = () => new URLSearchParams(window.location.search).get('tel') ?? undefined;

/**
 * Page unique : on choisit un téléphone (détecté ou cherché), on voit ses chargeurs. Le téléphone choisi est dans l'adresse
 * (`?tel=…`) : la page se partage et le bouton « Retour » fonctionne.
 */
export function App() {
  // Les fiches vérifiées tout de suite ; le catalogue complet (tous les téléphones) arrive juste après.
  const [appareils, setAppareils] = useState<Appareil[]>(TELEPHONES);
  const [catalogueCharge, setCatalogueCharge] = useState(false);
  const [id, setId] = useState(idDeLUrl);
  const [saisie, setSaisie] = useState('');
  const [detection, setDetection] = useState<Detection>({});
  const resultat = useRef<HTMLDivElement>(null);
  const telephone = useMemo(() => appareils.find((a) => a.id === id), [appareils, id]);

  useEffect(() => {
    let annule = false;
    // La détection attend le catalogue : ses références reconnaissent bien plus de modèles.
    chargerCatalogue()
      .catch(() => TELEPHONES as Appareil[])
      .then((tous) => {
        if (annule) return undefined;
        setAppareils(tous);
        setCatalogueCharge(true);
        return detecter(tous).then((d) => { if (!annule) setDetection(d); });
      })
      .catch(() => undefined);
    const retour = () => setId(idDeLUrl());
    window.addEventListener('popstate', retour);
    return () => { annule = true; window.removeEventListener('popstate', retour); };
  }, []);

  const choisir = (t: Appareil | undefined) => {
    setId(t?.id);
    setSaisie('');
    const url = new URL(window.location.href);
    if (t) url.searchParams.set('tel', t.id); else url.searchParams.delete('tel');
    window.history.pushState(null, '', url);
    document.title = t ? `Chargeur pour ${nomComplet(t)} | Chope ton chargeur` : 'Chope ton chargeur : le bon chargeur pour ton téléphone';
  };

  // Nouveau téléphone affiché : on amène son titre à l'écran et au lecteur d'écran.
  useEffect(() => {
    if (!telephone) return;
    const titre = resultat.current?.querySelector<HTMLElement>('#titre-telephone');
    titre?.focus({ preventScroll: true });
    resultat.current?.scrollIntoView?.({ block: 'start', behavior: 'smooth' });
  }, [telephone]);

  const marqueDetectee = !detection.telephone ? detection.marque : undefined;
  const modelesMarque = useMemo(
    () => (marqueDetectee ? chercher(appareils.filter((a) => a.marque === marqueDetectee), marqueDetectee, 8) : []),
    [appareils, marqueDetectee],
  );
  // Adresse partagée vers un téléphone du catalogue : on attend qu'il soit chargé avant de conclure qu'il n'existe pas.
  const enAttente = id !== undefined && !telephone && !catalogueCharge;

  return (
    <>
      <header className={styles.entete}>
        <a href="/" className={styles.logo} onClick={(e) => { e.preventDefault(); choisir(undefined); }}>
          <span className={styles.logoIcone}><Icone nom="eclair" taille={18} /></span>
          Chope ton chargeur
        </a>
      </header>

      <main className={styles.page}>
        {enAttente && <p role="status">Chargement du téléphone…</p>}
        {!telephone && !enAttente && (
          <section className={styles.accueil} aria-labelledby="titre-accueil">
            <h1 id="titre-accueil">Le bon chargeur pour ton téléphone, sans te tromper.</h1>
            <p className={styles.accroche}>Choisis ton modèle : on te dit quelle puissance il accepte et quels chargeurs le rechargent à pleine vitesse.</p>

            {detection.telephone && (
              <div className={styles.detecte} role="status">
                <p><span className={styles.detecteLibelle}>Appareil détecté</span>{nomComplet(detection.telephone)}</p>
                <button type="button" className="btn" onClick={() => choisir(detection.telephone)}>Voir ses chargeurs</button>
              </div>
            )}

            <Recherche telephones={appareils} saisie={saisie} onSaisie={setSaisie} onChoisir={choisir} />

            {modelesMarque.length > 0 && (
              <div className={styles.raccourcis}>
                <p className={styles.raccourcisTitre}>
                  {marqueDetectee === 'Apple' ? 'Tu es sur un iPhone : lequel ?' : `Tu es sur un ${marqueDetectee} : lequel ?`}
                </p>
                <div className={styles.puces}>
                  {modelesMarque.map((t) => <button key={t.id} type="button" className={styles.puce} onClick={() => choisir(t)}>{t.modele}</button>)}
                  <button type="button" className={styles.puce} onClick={() => setSaisie(`${marqueDetectee} `)}>Autre modèle…</button>
                </div>
              </div>
            )}

            <div className={styles.raccourcis}>
              <p className={styles.raccourcisTitre}>Ou pars de la marque</p>
              <div className={styles.puces}>
                {MARQUES.map((m) => <button key={m} type="button" className={styles.puce} onClick={() => setSaisie(`${m} `)}>{m}</button>)}
              </div>
            </div>

            <ol className={styles.etapes}>
              <li><strong>Ton téléphone</strong><span>Détecté tout seul quand c’est possible, sinon tu le cherches.</span></li>
              <li><strong>Ce qu’il accepte</strong><span>Puissance en watts, type de charge rapide, port.</span></li>
              <li><strong>Le bon chargeur</strong><span>Trié par vitesse, puissance, prix ou fiabilité.</span></li>
            </ol>

            <details className={styles.aide}>
              <summary>Mon téléphone n’est pas dans la liste</summary>
              <p>Essaie avec le nom écrit sur la boîte, ou seulement une partie (« s24 », « note 13 »). Sinon, cherche sur la fiche du constructeur la puissance de charge (en watts, « W ») : à défaut, un chargeur USB-C « Power Delivery » avec « PPS » de 30 à 45 W est le choix le plus polyvalent.</p>
            </details>
          </section>
        )}

        <div ref={resultat}>
          {telephone && <Resultat key={telephone.id} appareil={telephone} chargeurs={CHARGEURS} onChanger={() => choisir(undefined)} />}
        </div>
      </main>

      <footer className={styles.pied}>
        <p><strong>Liens affiliés.</strong> Les boutons « Voir sur Amazon » sont des liens partenaires : si tu achètes après avoir cliqué, le site peut toucher une commission, sans surcoût pour toi. En tant que Partenaire Amazon, nous réalisons un bénéfice sur les achats remplissant les conditions requises.</p>
        <p>Les puissances viennent des fiches des constructeurs ; la liste des téléphones, de la liste officielle des appareils Android de Google. Vérifie toujours la fiche du produit avant d’acheter. Aucun prix n’est affiché ici : ils changent sans cesse chez le marchand.</p>
        <details>
          <summary>Mentions légales et données personnelles</summary>
          <p>Éditeur du site : [à compléter]. Contact : [à compléter]. Hébergeur : [à compléter].</p>
          <p>Ce site ne dépose aucun cookie et ne suit pas ta navigation. La détection de ton appareil se fait dans ton navigateur : rien n’est envoyé ni enregistré. En cliquant sur un lien marchand, tu arrives sur le site du marchand, qui applique ses propres règles.</p>
        </details>
      </footer>
    </>
  );
}
