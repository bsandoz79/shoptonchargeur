import { useEffect, useState } from 'react';
import { Icone } from './Icone';
import { remonter } from './remonter';
import styles from './RetourHaut.module.css';

/** Bouton flèche en bas à gauche, visible dès qu'on a fait défiler la page d'un écran. */
export function RetourHaut() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const surDefilement = () => setVisible(window.scrollY > window.innerHeight * 0.8);
    surDefilement();
    window.addEventListener('scroll', surDefilement, { passive: true });
    return () => window.removeEventListener('scroll', surDefilement);
  }, []);
  // Absent tant qu'on est en haut : ni visible, ni atteignable au clavier.
  if (!visible) return null;
  return (
    <button type="button" className={styles.bouton} onClick={remonter} aria-label="Remonter en haut de la page">
      <Icone nom="haut" taille={22} />
    </button>
  );
}
