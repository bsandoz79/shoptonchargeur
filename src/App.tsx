import { useEffect, useMemo, useRef, useState } from 'react';
import { Icone } from './components/Icone';
import { Recherche } from './components/Recherche';
import { Resultat } from './components/Resultat';
import { CHARGEURS, TELEPHONES } from './data';
import { detecter, type Detection } from './moteur/detection';
import type { Telephone } from './moteur/types';
import styles from './App.module.css';

const MARQUES = [...new Set(TELEPHONES.map((t) => t.marque))];
const telephoneDeLUrl = () => TELEPHONES.find((t) => t.id === new URLSearchParams(window.location.search).get('tel'));

/**
 * Page unique : on choisit un téléphone (détecté ou cherché), on voit ses chargeurs. Le téléphone choisi est dans l'adresse
 * (`?tel=…`) : la page se partage et le bouton « Retour » fonctionne.
 */
export function App() {
  const [telephone, setTelephone] = useState<Telephone | undefined>(telephoneDeLUrl);
  const [saisie, setSaisie] = useState('');
  const [detection, setDetection] = useState<Detection>({});
  const resultat = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let annule = false;
    detecter(TELEPHONES).then((d) => { if (!annule) setDetection(d); }).catch(() => undefined);
    const retour = () => setTelephone(telephoneDeLUrl());
    window.addEventListener('popstate', retour);
    return () => { annule = true; window.removeEventListener('popstate', retour); };
  }, []);

  const choisir = (t: Telephone | undefined) => {
    setTelephone(t);
    setSaisie('');
    const url = new URL(window.location.href);
    if (t) url.searchParams.set('tel', t.id); else url.searchParams.delete('tel');
    window.history.pushState(null, '', url);
    document.title = t ? `Chargeur pour ${t.marque} ${t.modele} | Chope ton chargeur` : 'Chope ton chargeur : le bon chargeur pour ton téléphone';
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
    () => (marqueDetectee ? TELEPHONES.filter((t) => t.marque === marqueDetectee).slice(0, 8) : []),
    [marqueDetectee],
  );

  return (
    <>
      <header className={styles.entete}>
        <a href="/" className={styles.logo} onClick={(e) => { e.preventDefault(); choisir(undefined); }}>
          <span className={styles.logoIcone}><Icone nom="eclair" taille={18} /></span>
          Chope ton chargeur
        </a>
      </header>

      <main className={styles.page}>
        {!telephone && (
          <section className={styles.accueil} aria-labelledby="titre-accueil">
            <h1 id="titre-accueil">Le bon chargeur pour ton téléphone, sans te tromper.</h1>
            <p className={styles.accroche}>Choisis ton modèle : on te dit quelle puissance il accepte et quels chargeurs le rechargent à pleine vitesse.</p>

            {detection.telephone && (
              <div className={styles.detecte} role="status">
                <p><span className={styles.detecteLibelle}>Appareil détecté</span>{detection.telephone.marque} {detection.telephone.modele}</p>
                <button type="button" className="btn" onClick={() => choisir(detection.telephone)}>Voir ses chargeurs</button>
              </div>
            )}

            <Recherche telephones={TELEPHONES} saisie={saisie} onSaisie={setSaisie} onChoisir={choisir} />

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
              <p>Cherche sur la fiche du constructeur la puissance de charge (en watts, « W ») et le type de charge rapide. À défaut, un chargeur USB-C « Power Delivery » avec « PPS » de 30 à 45 W est le choix le plus polyvalent : il convient à la plupart des téléphones récents, à leur vitesse normale ou rapide.</p>
            </details>
          </section>
        )}

        <div ref={resultat}>
          {telephone && <Resultat key={telephone.id} telephone={telephone} chargeurs={CHARGEURS} onChanger={() => choisir(undefined)} />}
        </div>
      </main>

      <footer className={styles.pied}>
        <p><strong>Liens affiliés.</strong> Les boutons « Voir sur Amazon » sont des liens partenaires : si tu achètes après avoir cliqué, le site peut toucher une commission, sans surcoût pour toi. En tant que Partenaire Amazon, nous réalisons un bénéfice sur les achats remplissant les conditions requises.</p>
        <p>Les puissances viennent des fiches des constructeurs. Vérifie toujours la fiche du produit avant d’acheter. Aucun prix n’est affiché ici : ils changent sans cesse chez le marchand.</p>
        <details>
          <summary>Mentions légales et données personnelles</summary>
          <p>Éditeur du site : [à compléter]. Contact : [à compléter]. Hébergeur : [à compléter].</p>
          <p>Ce site ne dépose aucun cookie et ne suit pas ta navigation. La détection de ton appareil se fait dans ton navigateur : rien n’est envoyé ni enregistré. En cliquant sur un lien marchand, tu arrives sur le site du marchand, qui applique ses propres règles.</p>
        </details>
      </footer>
    </>
  );
}
