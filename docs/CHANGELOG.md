# Journal des modifications

## [Non publié]
### Modifié (design)
- Design premium noir et blanc, effet titane brossé : en-tête et haut de l'accueil en noir, titre et détails en dégradé titane, contenu sur fond blanc.
- Nouveau logo : le monogramme « STC », espacé, en titane. Nouvelles icônes (onglet, écran d'accueil, partage) sur fond noir.
- Accueil : grand titre et recherche à gauche, modèles récents à droite avec leur puissance alignée, onglets Téléphone / Ordinateur portable.
- Boutons noirs laqués et arrondis (titane sur fond noir), champ de recherche arrondi, bandeau « Meilleur rapport qualité/prix » en titane.
- Version sombre de l'appareil : tout le site passe en noir.

### Ajouté (référencement)
- Modèles proches en bas de chaque fiche téléphone (même marque, même gamme d'abord : S25, S25+, S24 Ultra…), dans le site et dans les pages générées.
- Pages générées : lien « Voir le prix » vers Amazon (lien affilié, `rel="sponsored nofollow"`) pour chaque chargeur, et pied de page lisible sans JavaScript (liens affiliés, mentions légales).

### Modifié (textes)
- L'introduction d'une fiche ne répète plus la première réponse des questions fréquentes (téléphones et ordinateurs).

### Corrigé (mentions légales)
- Éditeur (Baptiste Sandoz), contact (contact@bsandoz.fr) et hébergeur (o2switch) renseignés ; textes du pied de page dans `src/legal.ts`.

### Modifié (adresse)
- Nouvelle adresse https://shoptonchargeur.bsandoz.fr ; l'ancienne (choptonchargeur.bsandoz.fr) redirige page par page (301). Adresses canoniques, plan du site, aperçus et llms.txt sur la nouvelle.

### Modifié (nom)
- Le site s'appelle maintenant « Shop ton chargeur » (titres, en-tête, pages générées, llms.txt). L'adresse change dans un second temps (shoptonchargeur.bsandoz.fr, avec redirection de l'ancienne).

### Corrigé (chargement)
- Plus d'éclair de page en texte brut au chargement : le texte écrit pour les moteurs de recherche est caché dès que JavaScript tourne ; il reste lisible par les robots et sans JavaScript.

### Ajouté (questions avant l'achat)
- Cinq questions en tête du guide : « De quel chargeur ai-je besoin ? », « Quel chargeur choisir pour mon téléphone ? », « Comment savoir combien de watts accepte mon téléphone ? », « Faut-il acheter le chargeur de la marque ? », « Quel chargeur prendre pour plusieurs appareils ? ». Elles sont aussi sur l'accueil, en FAQ structurée.
- Titres : « Quel chargeur choisir pour ton téléphone ou ton PC ? » (accueil), « Comment choisir un chargeur » (guide).

### Ajouté (référencement)
- Adresses lisibles par appareil (`/chargeur/…/`, `/ordinateur/…/`, `/guide/`), 120 pages générées avec titre, description, adresse canonique, réponse en texte et FAQ, données structurées (FAQPage, BreadcrumbList, WebSite), `sitemap.xml`, `robots.txt` ouvert aux assistants, `llms.txt`, index de toutes les fiches sur l'accueil. Voir `docs/referencement.md`.

### Ajouté (logo)
- Logo du site (ordinateur, éclair, téléphone et prise) dans l'en-tête, en icône d'onglet, en icône d'écran d'accueil (iPhone) et en image de partage.

### Ajouté (ordinateurs par série)
- 30 ordinateurs et séries, rangés par marque : Apple, Lenovo (ThinkPad, IdeaPad, Legion), Dell (XPS, Latitude, Inspiron, Vostro, G), HP (EliteBook, ProBook, Pavilion, Envy, Victus, Omen), ASUS (Vivobook, Zenbook, TUF, ROG), Acer (Aspire, Swift, Nitro, Predator), MSI, Microsoft Surface, Framework, Samsung.
- Ordinateurs à prise ronde, rectangulaire ou Surface Connect : le chargeur d'origine de la marque est conseillé (même embout, même puissance ou plus), sans chargeur USB-C proposé.
- Chargeur d'origine mis en avant (« Conseillé par … ») ; plage de puissance quand elle dépend de la configuration (le haut de la plage est conseillé en USB-C), ou renvoi à l'étiquette quand elle varie trop.

### Ajouté (navigation)
- Le logo ramène à l'accueil et remonte en haut de la page.
- Bouton flèche « remonter » en bas à gauche, visible après un écran de défilement (sans animation si l'appareil demande moins d'animations).

### Ajouté (ordinateurs)
- Choix de l'ordinateur par modèle : recherche (« macbook air », « xps 13 »…) et liste. MacBook Air M1, Air 13 et 15 pouces, MacBook Pro 14 (M3/M4, Pro/Max) et 16 pouces, ThinkPad X1 Carbon Gen 12, Dell XPS 13 (9340, 9345), Framework Laptop 13, Galaxy Book4 Pro 14. Le choix par puissance du chargeur d'origine reste pour les autres.

### Modifié (vitesse de charge)
- Encadré à bord coloré remplacé par une échelle à trois niveaux (très rapide, rapide, doux), le niveau du chargeur en plein, et sa phrase d'explication.

### Modifié (textes)
- Textes du site réécrits plus simplement : phrases plus courtes, moins de guillemets et de deux-points, accroche « Quel chargeur pour ton téléphone ? ».

### Modifié (version française)
- Tous les chargeurs secteur en version à prise française (européenne) : liens directs gardés seulement quand la fiche le confirme (Samsung 25 W et Anker Nano 30 W remplacés par leur version FR), sinon recherche sur la référence européenne ; étiquette « Prise française » sur chaque carte ; question « Pourquoi prise française ? » dans le guide (versions UK et US à éviter).

### Ajouté (batterie et câbles)
- Effet de chaque charge sur la batterie (`src/moteur/batterie.ts`), d'après la puissance obtenue : très rapide (40 W et plus), rapide (21 à 39 W), douce (20 W et moins), avec deux jauges « Vitesse » et « Batterie ménagée » et une explication ; le sans fil est signalé comme plus chaud qu'un câble. Aucun chiffre d'usure n'est annoncé.
- Guide : « Charge rapide et batterie : à quel prix ? » et « Faire durer sa batterie » (4 conseils) ; longueur du câble expliquée.
- Câble à associer proposé en plusieurs longueurs (1 m, 2 m, et 3 m pour les câbles 60 W).

### Ajouté (priorités d'achat)
- « À acheter en priorité » en tête des résultats : le chargeur conseillé par le constructeur (celui de la marque qui donne la vitesse maximale, le moins puissant d'entre eux) et le meilleur rapport qualité/prix, en grandes cartes à bandeau ; puis « Les autres chargeurs compatibles », que le tri range. Même chose pour le sans fil (MagSafe conseillé par Apple…). Règles : `src/moteur/selection.ts`.
- Fiches vérifiées iPhone 17, 17 Pro, 17 Pro Max (40 W filaire, MagSafe 25 W) et iPhone Air (20 W, MagSafe 20 W) ; adaptateur secteur dynamique Apple 40 W.
- Liens directs vers la page du produit sur Amazon (identifiant ASIN) pour 14 produits ; recherche précise pour les autres.

### Corrigé (mise en ligne)
- Envoi FTPS : méthode de Perfect Clean (TLS 1.2, chaîne de certificats reconstituée), serveur et dossier réglables par secrets, échec clair si un secret manque au lieu d'un envoi sauté sans bruit, liste du dossier en ligne à la fin.

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
