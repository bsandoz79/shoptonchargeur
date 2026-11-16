# Journal des modifications

## [Non publié]
### Ajouté
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
