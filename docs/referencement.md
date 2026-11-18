# Référencement (moteurs de recherche et assistants)

## Ce qui est en place
- **Une adresse par appareil** : `/chargeur/<téléphone>/`, `/ordinateur/<ordinateur>/`, plus `/`, `/ordinateur/` et `/guide/`. Les anciens liens `?tel=…` et `?pc=…` restent compris.
- **Pages générées à la construction** (`src/seo/prerender.ts`, lancé par `npm run build`) : 120 pages (téléphones vérifiés, ordinateurs, accueil, guide, ordinateurs). Chacune a son titre, sa description, son adresse canonique et son contenu en texte dans le HTML : la réponse (chargeur conseillé par la marque, meilleur rapport qualité/prix, câble, sans fil) et une FAQ. Les assistants (ChatGPT, Perplexity, Claude, Gemini…) lisent souvent les pages sans exécuter JavaScript : ils trouvent donc la réponse directement. L'application remplace ce contenu une fois chargée. Ce texte est dans `<div data-statique>`, caché dès que JavaScript tourne (classe `js` posée par `index.html`, règle dans `src/styles/base.css`) : le visiteur ne voit pas de page en texte brut avant le site.
- **Données structurées** schema.org : `FAQPage` et `BreadcrumbList` sur les fiches, `WebSite` et `FAQPage` (questions avant l'achat : « de quel chargeur ai-je besoin ? », « quel chargeur choisir ? »…) sur l'accueil.
- **`sitemap.xml`**, **`robots.txt`** (tout est ouvert, y compris GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended…) et **`llms.txt`** (résumé du site et liste des pages pour les assistants).
- **Maillage interne** : l'accueil liste toutes les fiches par marque.
- Les téléphones du catalogue sans fiche vérifiée n'ont pas de page générée (contenu trop mince) : leur adresse est servie par l'application (`.htaccess`).

Le contenu des pages vient du même moteur que l'application (`src/seo/pages.ts`) : une modification des données met tout à jour au prochain envoi.

## À faire (une fois)
1. **Google Search Console** (search.google.com/search-console) : ajouter la propriété `https://choptonchargeur.bsandoz.fr`, la valider (fichier HTML à déposer dans `public/`, ou enregistrement DNS dans cPanel), puis soumettre `https://choptonchargeur.bsandoz.fr/sitemap.xml`.
2. **Bing Webmaster Tools** (bing.com/webmasters) : importer la propriété depuis Search Console et soumettre le même sitemap. Bing alimente aussi ChatGPT et Copilot.
3. Demander l'indexation de quelques pages clés (accueil, guide, iPhone et Galaxy récents) dans Search Console.

## Pour progresser
- Ajouter des fiches vérifiées pour les téléphones les plus vendus : chacune devient une page.
- Obtenir des liens depuis d'autres sites (portfolio, bsandoz.fr, forums, réseaux) : c'est ce qui pèse le plus pour Google comme pour les assistants.
