# Règles du projet choptonchargeur

## Le projet
« Chope ton chargeur » : outil web qui associe un téléphone à son chargeur compatible, monétisé par affiliation (pas de stock, pas de vente directe). Site statique React + Vite + TypeScript, hébergé chez o2switch (choptonchargeur.bsandoz.fr).

## Architecture
- `src/data/*.json` : les données (téléphones, chargeurs). Format et sources : `docs/donnees.md`.
- `src/moteur/` : logique pure, sans React, entièrement testée (compatibilité, recherche, détection, liens).
- `src/components/` : un composant = `Nom.tsx` + `Nom.module.css`. Aucune règle de compatibilité dans les composants.
- `src/styles/tokens.css` : seules couleurs et tailles du site.

## Méthode
1. Une tâche = une branche `feature/<nom>` ou `fix/<nom>` depuis `main`, fusionnée en `--no-ff`.
2. Commits au format Conventional Commits, en français.
3. Avant chaque commit : `docs/CHANGELOG.md` et la documentation concernée à jour.
4. Avant de pousser : `npm run lint`, `npm run test`, `npm run build` verts.
5. Ne jamais lancer de commande qui ne se termine pas (`npm run dev`, `vite preview`).
6. Jamais de secret dans le code : `.env.local` et secrets GitHub.

## Ne jamais
- Inventer une puissance, un protocole ou un prix : une donnée absente de la fiche du constructeur reste vide, et le site le dit (« Charge plus lente », `[à compléter]`).
- Afficher un prix en euros : seul le niveau de prix (1 à 3) est permis (règles du programme Partenaires Amazon).
- Retirer la mention des liens affiliés du pied de page.

## Interface
Mobile d'abord, accessibilité AA, textes en français au tutoiement (ton du nom du site). Pas de dégradés ni d'effets, icônes au trait, pas d'emojis.
