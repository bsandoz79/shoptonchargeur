# Mise en ligne

Le site est statique : le dossier `dist/` suffit, sans base de données ni PHP.

## 1. Sous-domaine (o2switch)
Dans cPanel → Domaines : créer `choptonchargeur.bsandoz.fr`, dossier `choptonchargeur.bsandoz.fr` (fait le 17/11/2026). Activer le certificat : SSL/TLS Status → cocher le sous-domaine → « Run AutoSSL ». `public/.htaccess` (envoyé avec le site) force le HTTPS : le certificat doit être actif avant le premier envoi.

## 2. Dépôt GitHub et envoi automatique
1. Dépôt : https://github.com/bsandoz79/choptonchargeur (branche `main`, poussée le 17/11/2026).
2. Dans cPanel → Comptes FTP : créer un compte limité au dossier du sous-domaine.
3. Dans GitHub → Settings → Secrets and variables → Actions :
   - secrets `FTP_USERNAME` et `FTP_PASSWORD` (le compte FTP ci-dessus) ;
   - variable `VITE_AMAZON_TAG` (identifiant Partenaires Amazon), quand il existe.
4. Chaque envoi sur `main` lance `.github/workflows/deploy.yml` : tests, build, envoi FTPS. Sans les secrets, l'envoi est sauté.

Le serveur FTP du fichier (`muguet.o2switch.net`) est celui des autres sites : à corriger s'il diffère.

## 3. Affiliation
1. S'inscrire au programme Partenaires Amazon (partenaires.amazon.fr) avec l'adresse du site en ligne.
2. Reporter l'identifiant (ex. `monsite-21`) dans la variable `VITE_AMAZON_TAG`.
3. Amazon demande des premières ventes dans les 180 jours, et la mention « En tant que Partenaire Amazon… » : elle est déjà en pied de page.

Autres marchands (Fnac, Boulanger, marques) : passer par une régie d'affiliation (Awin, Effinity…) et ajouter le marchand dans `src/moteur/affiliation.ts`.

## 4. Avant l'ouverture au public
- [ ] Recouper `telephones.json` et `chargeurs.json` avec les fiches des constructeurs (`docs/donnees.md`), et ajouter des fiches vérifiées pour les modèles les plus vendus.
- [ ] Vérifier chaque `requete` de `chargeurs.json` : la recherche Amazon doit montrer le bon produit en tête.
- [ ] Remplacer les `[à compléter]` des mentions légales (éditeur, contact, hébergeur) dans `src/App.tsx`.
- [ ] Tester la détection sur de vrais téléphones (Android Chrome, iPhone Safari).
