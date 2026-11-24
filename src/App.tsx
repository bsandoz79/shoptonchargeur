import { useEffect, useMemo, useRef, useState } from 'react';
import { Guide } from './components/Guide';
import { Icone } from './components/Icone';
import { Logo } from './components/Logo';
import { ChoixOrdinateur, ResultatOrdinateur } from './components/Ordinateur';
import { Recherche } from './components/Recherche';
import { RetourHaut } from './components/RetourHaut';
import { remonter } from './components/remonter';
import { Resultat } from './components/Resultat';
import { CHARGEURS, CHARGEURS_ORDINATEUR, ORDINATEURS, TELEPHONES, chargerCatalogue } from './data';
import { detecter, type Detection } from './moteur/detection';
import { chercher, nomComplet } from './moteur/recherche';
import type { Appareil } from './moteur/types';
import { chemin, cheminOrdinateur, cheminTelephone, lireAdresse, type Adresse } from './seo/adresses';
import styles from './App.module.css';
import { piedDePage } from './legal';

/** Quelques modèles récents en accès rapide sur l'accueil (fiches vérifiées). */
const ACCES_RAPIDE = ['apple-iphone-17-pro-max', 'apple-iphone-16', 'samsung-galaxy-s25-ultra', 'samsung-galaxy-s24', 'google-pixel-9', 'samsung-galaxy-a56-5g']
  .map((id) => TELEPHONES.find((t) => t.id === id))
  .filter((t): t is (typeof TELEPHONES)[number] => t !== undefined);

const MARQUES = ['Apple', 'Samsung', 'Google', 'Xiaomi', 'OnePlus', 'OPPO', 'HONOR', 'Motorola', 'realme', 'Nothing'];
const TITRE = 'Shop ton chargeur : quel chargeur pour ton téléphone ou ton ordinateur ?';
/** Ce que dit l'adresse : /chargeur/<téléphone>/, /ordinateur/<ordinateur>/, /ordinateur/, /guide/ (anciens liens ?tel=… compris). */
const lireAdresseCourante = () => lireAdresse(window.location.pathname, window.location.search);

/**
 * Page unique : on choisit un appareil (téléphone détecté ou cherché, ou ordinateur portable), on voit ses chargeurs et
 * pourquoi ils conviennent. Le choix est dans l'adresse : la page se partage et le bouton « Retour » fonctionne.
 */
export function App() {
  // Les fiches vérifiées tout de suite ; le catalogue complet arrive juste après.
  const [appareils, setAppareils] = useState<Appareil[]>(TELEPHONES);
  const [catalogueCharge, setCatalogueCharge] = useState(false);
  const [adresse, setAdresse] = useState<Adresse>(lireAdresseCourante);
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
    const retour = () => setAdresse(lireAdresseCourante());
    window.addEventListener('popstate', retour);
    return () => { annule = true; window.removeEventListener('popstate', retour); };
  }, []);

  const aller = (suivante: Adresse, titre = TITRE) => {
    setAdresse(suivante);
    setSaisie('');
    // Page affichée dans un cadre qui refuse de changer d'adresse (aperçu) : le choix s'affiche quand même.
    try { window.history.pushState(null, '', chemin(suivante)); } catch { /* adresse inchangée */ }
    document.title = titre;
  };
  const choisir = (t: Appareil) => aller({ tel: t.id }, `Chargeur pour ${nomComplet(t)} | Shop ton chargeur`);

  // Adresse /guide/ : on descend jusqu'au guide.
  useEffect(() => {
    if (adresse.guide) document.getElementById('titre-guide')?.scrollIntoView?.({ block: 'start' });
  }, [adresse.guide]);

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
            <Logo />
          </a>
          <nav aria-label="Rubriques" className={styles.nav}>
            <a href="/" onClick={(e) => { e.preventDefault(); aller({}); }}>Téléphones</a>
            <a href="/ordinateur/" onClick={(e) => { e.preventDefault(); aller({ pc: 'choix' }); }}>Ordinateurs</a>
            <a href="/guide/" onClick={(e) => { e.preventDefault(); aller({ guide: true }); document.getElementById('titre-guide')?.scrollIntoView?.({ behavior: 'smooth' }); }}>Le guide</a>
          </nav>
        </div>
      </header>

      <main className={styles.page}>
        {enAttente && <p role="status">Chargement du téléphone…</p>}
        {accueil && (
          <section className={styles.accueil} aria-labelledby="titre-accueil">
            <div className={`${styles.haut} ${partieOrdinateur ? styles.seul : ''}`}>
            <div className={styles.outil}>
            <p className={styles.surtitre}>Téléphones et ordinateurs portables</p>
            <h1 id="titre-accueil">Quel chargeur choisir pour ton téléphone&nbsp;?</h1>
            <p className={styles.accroche}>Tape ton modèle. On te montre le chargeur conseillé par la marque, le meilleur rapport qualité/prix et ce qui va le plus vite.</p>
            <div className={styles.parties} role="group" aria-label="Type d’appareil">
              <button type="button" className={styles.partie} aria-pressed={!partieOrdinateur} onClick={() => aller({})}>
                <Icone nom="telephone" /> Téléphone
              </button>
              <button type="button" className={styles.partie} aria-pressed={partieOrdinateur} onClick={() => aller({ pc: 'choix' })}>
                <Icone nom="ordinateur" /> Ordinateur portable
              </button>
            </div>

            {partieOrdinateur ? (
              <ChoixOrdinateur ordinateurs={ORDINATEURS} onChoisir={(o) => aller({ pc: o.id }, `Chargeur pour ${o.nom} | Shop ton chargeur`)} />
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
            <ul className={styles.garanties} aria-label="Nos engagements">
              <li><Icone nom="coche" taille={15} />Marques connues uniquement</li>
              <li><Icone nom="coche" taille={15} />Prise française</li>
              <li><Icone nom="coche" taille={15} />Sans inscription</li>
            </ul>
            </div>

            {!partieOrdinateur && (
              <section className={styles.rapide} aria-labelledby="titre-rapide">
                <h2 id="titre-rapide">Modèles récents</h2>
                <ul className={styles.cartesModeles}>
                  {ACCES_RAPIDE.map((t) => (
                    <li key={t.id}>
                      <button type="button" className={styles.carteModele} onClick={() => choisir(t)} aria-label={`${t.marque} ${t.modele}, jusqu’à ${t.puissanceMaxW} W`}>
                        <span>
                          <span className={styles.carteMarque}>{t.marque}</span>
                          <span className={styles.carteNom}>{t.modele}</span>
                        </span>
                        <span className={styles.carteW}>{t.puissanceMaxW} W</span>
                        <span className={styles.fleche}><Icone nom="fleche" taille={18} /></span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            </div>
          </section>
        )}

        <div ref={resultat}>
          {telephone && <Resultat key={telephone.id} appareil={telephone} chargeurs={CHARGEURS} onChanger={() => aller({})} onChoisir={choisir} />}
          {!telephone && ordinateur && (
            <ResultatOrdinateur key={ordinateur.id} ordinateur={ordinateur} chargeurs={CHARGEURS_ORDINATEUR} onChanger={() => aller({ pc: 'choix' })} />
          )}
        </div>

        {accueil && !partieOrdinateur && (
          <section className={styles.index} aria-labelledby="telephones">
            <h2 id="telephones">Chargeurs par téléphone</h2>
            {[...new Set(TELEPHONES.map((t) => t.marque))].map((m) => (
              <div key={m} className={styles.indexGroupe}>
                <h3>{m}</h3>
                <ul>
                  {TELEPHONES.filter((t) => t.marque === m).map((t) => (
                    <li key={t.id}><a href={cheminTelephone(t.id)} onClick={(e) => { e.preventDefault(); choisir(t); }}>{t.modele}</a></li>
                  ))}
                </ul>
              </div>
            ))}
            <h2>Chargeurs par ordinateur portable</h2>
            <ul className={styles.indexOrdis}>
              {ORDINATEURS.filter((o) => !o.generique).map((o) => (
                <li key={o.id}><a href={cheminOrdinateur(o.id)} onClick={(e) => { e.preventDefault(); aller({ pc: o.id }, `Chargeur pour ${o.nom} | Shop ton chargeur`); }}>{o.marque === 'Apple' ? o.nom : `${o.marque} ${o.nom}`}</a></li>
              ))}
            </ul>
          </section>
        )}

        <Guide />
      </main>

      <footer className={styles.pied}>
        <p><strong>Liens affiliés.</strong> {piedDePage.affiliation}</p>
        <p>{piedDePage.prudence}</p>
        <details>
          <summary>Mentions légales et données personnelles</summary>
          <p>Éditeur du site : {piedDePage.editeur}. Contact : <a href={`mailto:${piedDePage.email}`}>{piedDePage.email}</a>. Hébergeur : {piedDePage.hebergeur}</p>
          <p>{piedDePage.donnees}</p>
        </details>
      </footer>
      <RetourHaut />
    </>
  );
}
