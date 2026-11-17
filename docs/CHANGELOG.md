# Journal des modifications

## [Non publié]
### Ajouté (mise en ligne)
- `public/.htaccess` : HTTPS forcé, cache long des fichiers versionnés, page jamais en cache, en-têtes de sécurité, compression.

### Modifié (refonte boutique)
- Présentation façon boutique en ligne : cartes produit avec visuel, marque, verdict sur l'appareil, caractéristiques, rapport qualité/prix, niveau de prix, « Pourquoi il convient » dépliable, bouton « Voir le prix » ; grille de 1 à 3 colonnes ; onglets « Chargeur secteur » et « Sans fil » ; tri par menu ; en-tête fixe avec rubriques ; boutons plus sobres (noir plein, contour).
- Chaque produit a son dessin (`src/components/Illustration.tsx` : bloc compact, cube, GaN multiport, gros bloc, MagSafe, tapis, support, câble), à la place des photos des marchands, qui ne peuvent pas être reprises.
- Chaque chargeur indique le câble à associer (USB-C 60 W, 5 A 100 W, 240 W ou Lightning MFi) : le bloc seul ne suffit pas.

### Ajouté (refonte boutique)
- Chargeurs sans fil, seulement constructeurs et grandes marques : Apple MagSafe 25 W, Anker MagGo Qi2, Belkin Qi2, Samsung 15 W, Pixel Stand 2, Anker 313 (Qi). Compatibilité par téléphone (`src/moteur/sansFil.ts`) : magnétiques pour les iPhone MagSafe, Qi pour les autres, aucun pour les téléphones sans recharge sans fil.
- Rapport qualité/prix (`src/moteur/qualitePrix.ts`) : notre évaluation, barème publié (vitesse obtenue, fiabilité, niveau de prix), jamais une note d'acheteurs.
- Guide : « Comment fonctionne un bloc », « Comment fonctionne un câble », « Pourquoi éviter les chargeurs premier prix », illustrés.

### Corrigé
- Choix d'un appareil possible même quand la page est affichée dans un cadre qui refuse de changer d'adresse (aperçu).

### Ajouté
- Explications : sous chaque chargeur, « Pourquoi ? » dit en clair d'où vient la vitesse annoncée (Power Delivery commun, PPS, PPS sans 5 A, charge de la marque, puissance insuffisante). Les textes suivent exactement le calcul du moteur (`src/moteur/explications.ts`).
- Guide « Comment ça marche, un chargeur ? » en bas de page : watts, Power Delivery, PPS, charge propre aux marques, câble, ralentissement en fin de charge, GaN, chargeur d'ordinateur sur un téléphone.
- Ordinateurs portables rechargés en USB-C : choix par la puissance du chargeur d'origine (45, 65, 90 à 100, 140 W) ou parmi les MacBook, chargeurs récents (GaN) de 45 à 140 W, verdict expliqué (recharge rapide, normale, trop faible), câble conseillé.

### Modifié
- Catalogue limité aux iPhone et aux téléphones Android à port USB-C : 1 566 modèles récents au lieu de 7 613 (gammes reconnues par leur nom, voir `scripts/catalogue.mjs`).

### Ajouté (catalogue)
- Catalogue complet : 7 613 téléphones de 37 marques dans la recherche, tirés de la liste officielle des appareils Android de Google (`npm run catalogue`), chargé à part de la page. Les téléphones sans fiche de charge vérifiée affichent un conseil général par marque et des chargeurs polyvalents, sans annoncer de vitesse.
- Recherche par le nom seul : « s24 ultra » suffit, « s » propose les Galaxy S du plus récent au plus ancien.
- Détection plus précise : références de modèle exactes du catalogue.

### Modifié
- Chargeurs : seulement des constructeurs et de grandes marques (Anker Nano 20, 30 et 45 W, Belkin BoostCharge 30 W, UGREEN Nexode 45 W) à la place des familles génériques.
- Galaxy 45 W : 45 W annoncés seulement avec un chargeur à PPS 5 A, 25 W avec les autres chargeurs PPS.
- Fiches vérifiées renommées comme dans la liste Google (« Galaxy A55 5G », « OnePlus 11 5G »…).

### Première version
- Première version : recherche d'un téléphone par marque et modèle, détection de l'appareil (modèle Android reconnu, marque sinon), fiche de charge (puissance, port, charge rapide), chargeurs compatibles triés par vitesse, puissance, prix ou fiabilité, conseil sur le câble.
- Données de départ : 83 téléphones (Apple, Samsung, Google, Xiaomi, OnePlus) et 9 chargeurs, plus le chargeur d'origine des marques à charge propriétaire.
- Liens marchands vers Amazon, avec identifiant d'affiliation réglable (`VITE_AMAZON_TAG`) et mention légale en pied de page.
- Téléphone choisi dans l'adresse (`?tel=…`) : page partageable, bouton « Retour » fonctionnel.
- Envoi automatique vers o2switch (GitHub Actions), sauté tant que les secrets FTP ne sont pas réglés.
