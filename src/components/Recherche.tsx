import { useId, useMemo, useState, type KeyboardEvent } from 'react';
import { chercher, normaliser } from '../moteur/recherche';
import type { Appareil } from '../moteur/types';
import { Icone } from './Icone';
import styles from './Recherche.module.css';

/**
 * Recherche d'un téléphone par marque et modèle : liste de suggestions au fil de la saisie, utilisable au clavier
 * (flèches, Entrée, Échap). `saisie` est pilotée par le parent (les raccourcis de marque la remplissent).
 */
export function Recherche({ telephones, saisie, onSaisie, onChoisir, libelle = 'Quel téléphone veux-tu recharger ?', exemple = 'Ex. s24 ultra, iphone 15, pixel 8', nomListe = 'Téléphones trouvés', aideVide = 'Essaie avec moins de mots, ou regarde le conseil « Mon téléphone n’est pas dans la liste » plus bas.' }: {
  telephones: Appareil[]; saisie: string; onSaisie: (texte: string) => void; onChoisir: (telephone: Appareil) => void;
  libelle?: string; exemple?: string; nomListe?: string; aideVide?: string;
}) {
  const id = useId();
  const [ouvert, setOuvert] = useState(false);
  const [actif, setActif] = useState(0);
  const resultats = useMemo(() => chercher(telephones, saisie), [telephones, saisie]);
  const visible = ouvert && saisie.trim() !== '';

  const choisir = (t: Appareil) => { setOuvert(false); onChoisir(t); };
  const auClavier = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') { setOuvert(false); return; }
    if (!resultats.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setOuvert(true); setActif((i) => (i + 1) % resultats.length); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setOuvert(true); setActif((i) => (i - 1 + resultats.length) % resultats.length); }
    if (e.key === 'Enter' && visible) { e.preventDefault(); choisir(resultats[Math.min(actif, resultats.length - 1)]); }
  };

  return (
    <div className={styles.recherche}>
      <label htmlFor={`${id}-champ`} className={styles.libelle}>{libelle}</label>
      <div className={styles.champ}>
        <span className={styles.loupe}><Icone nom="loupe" /></span>
        <input id={`${id}-champ`} type="search" role="combobox" autoComplete="off" spellCheck={false} enterKeyHint="search"
          placeholder={exemple} value={saisie}
          aria-expanded={visible} aria-controls={`${id}-liste`} aria-autocomplete="list"
          aria-activedescendant={visible && resultats.length ? `${id}-option-${Math.min(actif, resultats.length - 1)}` : undefined}
          onChange={(e) => { onSaisie(e.target.value); setActif(0); setOuvert(true); }}
          onFocus={() => setOuvert(true)} onKeyDown={auClavier} />
      </div>
      <ul id={`${id}-liste`} role="listbox" aria-label={nomListe} className={styles.liste} hidden={!visible || !resultats.length}>
        {resultats.map((t, i) => (
          <li key={t.id} id={`${id}-option-${i}`} role="option" aria-selected={i === actif} className={styles.option}
            // « mousedown » : avant que le champ ne perde le focus.
            onMouseDown={(e) => { e.preventDefault(); choisir(t); }} onMouseEnter={() => setActif(i)}>
            <span>{!normaliser(t.modele).startsWith(normaliser(t.marque)) && <span className={styles.marque}>{t.marque} </span>}{t.modele}</span>
            {t.annee && <span className={styles.annee}>{t.annee}</span>}
          </li>
        ))}
      </ul>
      {visible && !resultats.length && (
        <p role="status" className={styles.vide}>
          Rien trouvé pour « {saisie.trim()} ». {aideVide}
        </p>
      )}
    </div>
  );
}
