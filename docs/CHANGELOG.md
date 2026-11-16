# Journal des modifications

## [Non publié]
### Ajouté
- Première version : recherche d'un téléphone par marque et modèle, détection de l'appareil (modèle Android reconnu, marque sinon), fiche de charge (puissance, port, charge rapide), chargeurs compatibles triés par vitesse, puissance, prix ou fiabilité, conseil sur le câble.
- Données de départ : 83 téléphones (Apple, Samsung, Google, Xiaomi, OnePlus) et 9 chargeurs, plus le chargeur d'origine des marques à charge propriétaire.
- Liens marchands vers Amazon, avec identifiant d'affiliation réglable (`VITE_AMAZON_TAG`) et mention légale en pied de page.
- Téléphone choisi dans l'adresse (`?tel=…`) : page partageable, bouton « Retour » fonctionnel.
- Envoi automatique vers o2switch (GitHub Actions), sauté tant que les secrets FTP ne sont pas réglés.
