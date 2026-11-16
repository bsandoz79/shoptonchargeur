import { GUIDE } from '../moteur/explications';
import styles from './Guide.module.css';

/** « Comment ça marche, un chargeur ? » : les notions utiles, une question par volet dépliable. */
export function Guide() {
  return (
    <section className={styles.guide} aria-labelledby="titre-guide">
      <h2 id="titre-guide">Comment ça marche, un chargeur ?</h2>
      <p className={styles.intro}>Pas besoin d’être technicien : voici ce qui fait qu’un chargeur va vite, ou pas, avec ton appareil.</p>
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
