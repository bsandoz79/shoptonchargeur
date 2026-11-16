# Données

Trois fichiers JSON dans `src/data/`. Les types sont décrits dans `src/moteur/types.ts`.

| Fichier | Contenu | Mise à jour |
| --- | --- | --- |
| `catalogue.json` | tous les téléphones : marque, nom, références de modèle (7 613 au 17/11/2026) | automatique : `npm run catalogue` |
| `telephones.json` | les fiches de charge vérifiées (83) | à la main |
| `chargeurs.json` | les chargeurs conseillés (10) | à la main |

## `catalogue.json` : tous les téléphones
Construit par `scripts/catalogue.mjs` à partir de la **liste officielle des appareils Android de Google** (`supported_devices.csv`, publiée pour les développeurs) : nom commercial et références de modèle de 37 marques. Le script écarte tablettes, montres, téléviseurs et ordinateurs. Les iPhone, absents de cette liste, sont ajoutés dans le script.

Cette liste ne contient **aucune donnée de charge**. Aucune base libre et à jour ne donne la puissance de charge de tous les téléphones : les bases complètes (GSMArena et ses dérivés) sont payantes ou interdisent la copie. D'où deux niveaux :
- téléphone avec fiche dans `telephones.json` : puissance, protocole, vitesse obtenue par chargeur ;
- téléphone du catalogue seul : il se trouve dans la recherche et se détecte, mais le site affiche « Fiche de charge pas encore vérifiée », un conseil général par marque (`src/moteur/marques.ts`) et des chargeurs polyvalents, sans annoncer de vitesse.

Format d'une ligne : `[marque, modèle, [références], année facultative]`.

Relancer `npm run catalogue` de temps en temps récupère les nouveaux modèles. Le nom d'une fiche vérifiée doit être celui de la liste Google (« Galaxy A55 5G », pas « Galaxy A55 ») : sinon le téléphone apparaît deux fois. Un test le vérifie pour le Galaxy S24 ; le contrôler à chaque ajout.

## `telephones.json` : les fiches vérifiées
| Champ | Rôle |
| --- | --- |
| `id` | identifiant dans l'adresse (`?tel=samsung-galaxy-s24`) |
| `marque`, `modele`, `annee` | affichage et recherche |
| `port` | `usb-c` ou `lightning` |
| `puissanceMaxW` | puissance maximale en filaire, donnée par le constructeur |
| `protocole` | ce qu'il faut pour l'atteindre : `pd` (Power Delivery), `pps` (Power Delivery avec PPS), `proprietaire` (charge de la marque) |
| `puissanceSansProtocoleW` | puissance avec un chargeur USB-C sans ce protocole, si le constructeur la donne (Samsung : 15 W) |
| `techno` | nom de la charge de la marque (HyperCharge, SUPERVOOC…) |
| `cable5A` | `true` si la puissance maximale demande un PPS à 5 A, côté chargeur et côté câble (Samsung 45 W) |
| `codes` | débuts de références (`SM-S921`) ; les références exactes viennent du catalogue |

## `chargeurs.json` : les chargeurs conseillés
Seulement des chargeurs de constructeurs (Apple, Samsung, Google) et de grandes marques d'accessoires (Anker, Belkin, UGREEN).

| Champ | Rôle |
| --- | --- |
| `puissanceW`, `ppsMaxW`, `protocoles` | ce que le chargeur sait fournir |
| `pps5A` | PPS à 5 A : seul moyen de dépasser 25 W sur un Galaxy 45 W |
| `fiabilite` | 3 : chargeur du constructeur ; 2 : grande marque |
| `budget` | niveau de prix indicatif de 1 à 3 (choix éditorial) |
| `requete` | recherche envoyée au marchand |

Ce qui a été vérifié le 17/11/2026 :
- Anker Nano 30 W : fiche du fabricant (Power Delivery 30 W, PPS 3,3 à 11 V sous 3 A).
- Belkin BoostCharge 30 W : pages Belkin (Power Delivery 3.0 et PPS, jusqu'à 25 W sur un Galaxy).
- UGREEN Nexode 45 W : annonces de revendeurs (compatible 45 W Samsung avec un câble 5 A), pas de fiche officielle trouvée. Une note le dit sur la carte.
- Anker Nano 45 W : selon la version, il ne donne que 25 à 30 W aux Galaxy 45 W. Il n'a donc pas `pps5A` : le site annonce 25 W pour ces téléphones.
- Chargeurs Apple, Samsung, Google et Anker Nano 20 W : saisis de mémoire, à recouper.

Le site n'affiche ni note ni nombre d'avis : ces chiffres changent sans cesse et ne peuvent être repris d'Amazon que par son interface officielle.

Le chargeur d'origine des marques à charge propriétaire (Xiaomi, OnePlus, OPPO…) n'est pas dans le fichier : le moteur le crée à partir du téléphone.

## Règles du moteur
- Power Delivery : le téléphone prend le plus petit des deux, sa puissance maximale ou celle du chargeur.
- PPS : sans PPS, le téléphone retombe à `puissanceSansProtocoleW` ; si elle n'est pas connue, la carte affiche « Charge plus lente », sans chiffre.
- Galaxy 45 W (`cable5A`) : 45 W seulement avec un chargeur `pps5A`, 25 W avec un autre chargeur PPS.
- Charge propriétaire : seul le chargeur de la marque donne la puissance maximale.
- Le chargeur d'un constructeur (Apple, Samsung, Google) n'est proposé que pour ses propres téléphones.

## Recherche
`src/moteur/recherche.ts`. Chaque mot saisi doit commencer un mot de la marque ou du modèle. Ordre des résultats : le nom exact ; puis les modèles dont chaque mot saisi est un mot entier ou le début d'un numéro (« s » trouve « S25 », pas « Sidekick ») ; puis les autres. À égalité : grandes marques d'abord, numéros décroissants (S26, S25, S24…), iPhone par année. 30 résultats au plus.

## Pourquoi aucun prix
Les prix changent sans cesse, et le programme Partenaires Amazon n'autorise l'affichage d'un prix que s'il vient de son interface officielle. Le site affiche donc un niveau de prix (€ à €€€) et laisse le prix exact au marchand.

## Fiches vérifiées : sources et limites
83 fiches (Apple, Samsung, Google, Xiaomi, OnePlus), saisies de mémoire à partir des annonces des constructeurs. **Elles n'ont pas été recoupées ligne par ligne avec les fiches officielles : à faire avant l'ouverture au public.**
- Apple : « adaptateur 20 W ou plus » à partir de l'iPhone 12, « 18 W ou plus » de l'iPhone 8 à l'iPhone 11. Apple ne publie pas de puissance maximale ; la valeur saisie est la puissance conseillée.
- Samsung : 25 W ou 45 W en PPS selon le modèle, 15 W sans PPS.
- Google : puissance annoncée par modèle ; la puissance sans PPS n'est pas renseignée.
- Xiaomi, OnePlus : puissance du chargeur de la marque ; les versions vendues en France peuvent différer.

## Ajouter une fiche vérifiée
1. Relever sur la fiche du constructeur : puissance de charge filaire, type de charge rapide, port.
2. Ajouter l'entrée dans `telephones.json`, avec le nom exact du catalogue (identifiant : ce nom en minuscules avec des tirets).
3. `npm run test` : les tests vérifient les identifiants, la cohérence des puissances, et qu'au moins un chargeur donne la vitesse maximale.
