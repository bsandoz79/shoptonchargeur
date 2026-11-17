import { ESSENTIELS, GUIDE } from '../moteur/explications';
import { Illustration } from './Illustration';
import styles from './Guide.module.css';

/** Le guide : trois explications illustrées (bloc, câble, entrée de gamme), puis les questions fréquentes. */
export function Guide() {
  return (
    <section className={styles.guide} aria-labelledby="titre-guide">
      <div className={styles.tete}>
        <p className={styles.surtitre}>Le guide</p>
        <h2 id="titre-guide">Comment ça marche, un chargeur ?</h2>
        <p className={styles.intro}>Pas besoin d’être technicien : voici ce qui fait qu’un chargeur va vite, ou pas, et pourquoi on ne te propose que des marques sérieuses.</p>
      </div>
      <div className={styles.essentiels}>
        {ESSENTIELS.map((e) => (
          <article key={e.id} className={styles.essentiel} aria-labelledby={`guide-${e.id}`}>
            <div className={styles.visuel}><Illustration forme={e.forme} teinte={e.id === 'camelote' ? 'gris' : 'blanc'} taille={130} /></div>
            <h3 id={`guide-${e.id}`}>{e.titre}</h3>
            <ul>{e.points.map((p) => <li key={p}>{p}</li>)}</ul>
          </article>
        ))}
      </div>
      <h3 className={styles.titreQuestions}>Questions fréquentes</h3>
      <div className={styles.questions}>
        {GUIDE.map(({ question, reponse }) => (
          <details key={question} className={styles.question}>
            {/* Espace insécable : le point d'interrogation ne passe jamais seul à la ligne. */}
            <summary><span>{question.replace(/ \?$/, ' ?')}</span></summary>
            <p>{reponse}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
