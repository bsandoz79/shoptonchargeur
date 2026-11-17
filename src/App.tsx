import { useEffect, useMemo, useRef, useState } from 'react';
import { Guide } from './components/Guide';
import { Icone } from './components/Icone';
import { Illustration } from './components/Illustration';
import { ChoixOrdinateur, ResultatOrdinateur } from './components/Ordinateur';
import { Recherche } from './components/Recherche';
import { RetourHaut } from './components/RetourHaut';
import { remonter } from './components/remonter';
import { Resultat } from './components/Resultat';
import { CHARGEURS, CHARGEURS_ORDINATEUR, ORDINATEURS, TELEPHONES, chargerCatalogue } from './data';
import { detecter, type Detection } from './moteur/detection';
import { chercher, nomComplet } from './moteur/recherche';
import type { Appareil } from './moteur/types';
import styles from './App.module.css';

const MARQUES = ['Apple', 'Samsung', 'Google', 'Xiaomi', 'OnePlus', 'OPPO', 'HONOR', 'Motorola', 'realme', 'Nothing'];
const TITRE = 'Chope ton chargeur : le bon chargeur pour ton téléphone ou ton ordinateur';
/** Ce que dit l'adresse : `?tel=<téléphone>`, ou `?pc=<ordinateur>` (`?pc=choix` : la partie ordinateurs, rien de choisi). */
const lireAdresse = () => {
  const params = new URLSearchParams(window.location.search);
  return { tel: params.get('tel') ?? undefined, pc: params.get('pc') ?? undefined };
};

/**
 * Page unique : on choisit un appareil (téléphone détecté ou cherché, ou ordinateur portable), on voit ses chargeurs et
 * pourquoi ils conviennent. Le choix est dans l'adresse : la page se partage et le bouton « Retour » fonctionne.
 */
export function App() {
  // Les fiches vérifiées tout de suite ; le catalogue complet arrive juste après.
  const [appareils, setAppareils] = useState<Appareil[]>(TELEPHONES);
  const [catalogueCharge, setCatalogueCharge] = useState(false);
  const [adresse, setAdresse] = useState<{ tel?: string; pc?: string }>(lireAdresse);
  const [saisie, setSaisie] = useState('');
  const [detection, setDetection] = useState<Detection>({});
  const resultat = useRef<HTMLDivElement>(null);
  const telephone = useMemo(() => appareils.find((a) => a.id === adresse.tel), [appareils, adresse.tel]);
  const ordinateur = ORDINATEURS.find((o) => o.id === adresse.pc);
  const partieOrdinateur = adresse.pc !== undefined && !telephone;

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
    const retour = () => setAdresse(lireAdresse());
    window.addEventListener('popstate', retour);
    return () => { annule = true; window.removeEventListener('popstate', retour); };
  }, []);

  const aller = (suivante: { tel?: string; pc?: string }, titre = TITRE) => {
    setAdresse(suivante);
    setSaisie('');
    const url = new URL(window.location.href);
    for (const cle of ['tel', 'pc'] as const) {
      if (suivante[cle]) url.searchParams.set(cle, suivante[cle]); else url.searchParams.delete(cle);
    }
    // Page affichée dans un cadre qui refuse de changer d'adresse (aperçu) : le choix s'affiche quand même.
    try { window.history.pushState(null, '', url); } catch { /* adresse inchangée */ }
    document.title = titre;
  };
  const choisir = (t: Appareil) => aller({ tel: t.id }, `Chargeur pour ${nomComplet(t)} | Chope ton chargeur`);

  // Nouvel appareil affiché : on amène son titre à l'écran et au lecteur d'écran.
  const affiche = telephone?.id ?? ordinateur?.id;
  useEffect(() => {
    if (!affiche) return;
    const titre = resultat.current?.querySelector<HTMLElement>('#titre-telephone');
    titre?.focus({ preventScroll: true });
    resultat.current?.scrollIntoView?.({ block: 'start', behavior: 'smooth' });
  }, [affiche]);

  const marqueDetectee = !detection.telephone ? detection.marque : undefined;
  const modelesMarque = useMemo(
    () => (marqueDetectee ? chercher(appareils.filter((a) => a.marque === marqueDetectee), marqueDetectee, 8) : []),
    [appareils, marqueDetectee],
  );
  // Adresse partagée vers un téléphone du catalogue : on attend qu'il soit chargé avant de conclure qu'il n'existe pas.
  const enAttente = adresse.tel !== undefined && !telephone && !catalogueCharge;
  const accueil = !telephone && !ordinateur && !enAttente;

  return (
    <>
      <header className={styles.entete}>
        <div className={styles.enteteInterieur}>
          <a href="/" className={styles.logo} onClick={(e) => { e.preventDefault(); aller({}); remonter(); }}>
            <span className={styles.logoIcone}><Icone nom="eclair" taille={18} /></span>
            Chope ton chargeur
          </a>
          <nav aria-label="Rubriques" className={styles.nav}>
            <a href="/" onClick={(e) => { e.preventDefault(); aller({}); }}>Téléphones</a>
            <a href="/?pc=choix" onClick={(e) => { e.preventDefault(); aller({ pc: 'choix' }); }}>Ordinateurs</a>
            <a href="#titre-guide">Le guide</a>
          </nav>
        </div>
      </header>

      <main className={styles.page}>
        {enAttente && <p role="status">Chargement du téléphone…</p>}
        {accueil && (
          <section className={styles.accueil} aria-labelledby="titre-accueil">
            <div className={styles.hero}>
              <div className={styles.heroTexte}>
                <h1 id="titre-accueil">Quel chargeur pour ton téléphone ?</h1>
                <p className={styles.accroche}>Tape ton modèle. On te montre le chargeur conseillé par la marque, le meilleur rapport qualité/prix et ce qui va le plus vite.</p>
              </div>
              <div className={styles.heroVisuel} aria-hidden="true">
                <Illustration forme="gan" teinte="gris" taille={150} />
                <Illustration forme="magsafe" teinte="blanc" taille={130} />
              </div>
            </div>
            <ul className={styles.garanties} aria-label="Nos engagements">
              <li><Icone nom="coche" taille={16} />Marques connues uniquement</li>
              <li><Icone nom="coche" taille={16} />Prise française</li>
              <li><Icone nom="coche" taille={16} />Sans inscription</li>
            </ul>

            <div className={styles.parties} role="group" aria-label="Type d’appareil">
              <button type="button" className={styles.partie} aria-pressed={!partieOrdinateur} onClick={() => aller({})}>
                <Icone nom="telephone" /> Téléphone
              </button>
              <button type="button" className={styles.partie} aria-pressed={partieOrdinateur} onClick={() => aller({ pc: 'choix' })}>
                <Icone nom="ordinateur" /> Ordinateur portable
              </button>
            </div>

            {partieOrdinateur ? (
              <ChoixOrdinateur ordinateurs={ORDINATEURS} onChoisir={(o) => aller({ pc: o.id }, `Chargeur pour ${o.nom} | Chope ton chargeur`)} />
            ) : (
              <>
                {detection.telephone && (
                  <div className={styles.detecte} role="status">
                    <p><span className={styles.detecteLibelle}>Appareil détecté</span>{nomComplet(detection.telephone)}</p>
                    <button type="button" className="btn" onClick={() => choisir(detection.telephone!)}>Voir ses chargeurs</button>
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

                <details className={styles.aide}>
                  <summary>Mon téléphone n’est pas dans la liste</summary>
                  <p>On a les iPhone et les téléphones Android en USB-C. Essaie avec le nom écrit sur la boîte, ou juste une partie (s24, note 13…). Si ton téléphone est plus ancien, en micro-USB, garde son chargeur d’origine. Sinon, un chargeur USB-C avec PPS de 30 à 45 W ira avec presque tout.</p>
                </details>
              </>
            )}
          </section>
        )}

        <div ref={resultat}>
          {telephone && <Resultat key={telephone.id} appareil={telephone} chargeurs={CHARGEURS} onChanger={() => aller({})} />}
          {!telephone && ordinateur && (
            <ResultatOrdinateur key={ordinateur.id} ordinateur={ordinateur} chargeurs={CHARGEURS_ORDINATEUR} onChanger={() => aller({ pc: 'choix' })} />
          )}
        </div>

        <Guide />
      </main>

      <footer className={styles.pied}>
        <p><strong>Liens affiliés.</strong> Les liens vers Amazon sont des liens partenaires. Si tu achètes après avoir cliqué, on touche une petite commission, sans que ça te coûte plus cher. En tant que Partenaire Amazon, nous réalisons un bénéfice sur les achats remplissant les conditions requises.</p>
        <p>Tous les chargeurs sont en version prise française. Les puissances viennent des fiches des fabricants. Jette quand même un œil à la fiche du produit avant d’acheter, et au prix, qui change souvent chez le marchand.</p>
        <details>
          <summary>Mentions légales et données personnelles</summary>
          <p>Éditeur du site : [à compléter]. Contact : [à compléter]. Hébergeur : [à compléter].</p>
          <p>Pas de cookie, pas de suivi. La détection de ton téléphone se fait dans ton navigateur, rien n’est envoyé ni gardé. Une fois sur le site du marchand, ce sont ses règles qui s’appliquent.</p>
        </details>
      </footer>
      <RetourHaut />
    </>
  );
}
