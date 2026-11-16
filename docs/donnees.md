# Données

Tout le contenu du site tient dans deux fichiers JSON de `src/data/`. Les types sont décrits dans `src/moteur/types.ts`.

## `telephones.json`
| Champ | Rôle |
| --- | --- |
| `id` | identifiant dans l'adresse (`?tel=samsung-galaxy-s24`) |
| `marque`, `modele`, `annee` | affichage et recherche |
| `port` | `usb-c` ou `lightning` |
| `puissanceMaxW` | puissance maximale en filaire, donnée par le constructeur |
| `protocole` | ce qu'il faut pour l'atteindre : `pd` (Power Delivery), `pps` (Power Delivery avec PPS), `proprietaire` (charge de la marque) |
| `puissanceSansProtocoleW` | puissance avec un chargeur USB-C sans ce protocole, si le constructeur la donne (Samsung : 15 W) |
| `techno` | nom de la charge de la marque (HyperCharge, SUPERVOOC…) |
| `cable5A` | `true` si la puissance maximale demande un câble 5 A (Samsung 45 W) |
| `codes` | débuts des références annoncées par le navigateur (`SM-S921` pour le Galaxy S24), pour la détection |

## `chargeurs.json`
| Champ | Rôle |
| --- | --- |
| `puissanceW`, `ppsMaxW`, `protocoles` | ce que le chargeur sait fournir |
| `fiabilite` | 3 : chargeur du constructeur ; 2 : marque reconnue ; 1 : autre |
| `budget` | niveau de prix indicatif de 1 à 3 (choix éditorial) |
| `requete` | recherche envoyée au marchand |
| `generique` | famille de chargeurs (plusieurs marques) plutôt qu'un produit précis |

Le chargeur d'origine des marques à charge propriétaire (Xiaomi, OnePlus) n'est pas dans le fichier : le moteur le crée à partir du téléphone.

## Règles du moteur
- Power Delivery : le téléphone prend le plus petit des deux, sa puissance maximale ou celle du chargeur.
- PPS : sans PPS, le téléphone retombe à `puissanceSansProtocoleW` ; si elle n'est pas connue, la carte affiche « Charge plus lente », sans chiffre.
- Charge propriétaire : seul le chargeur de la marque donne la puissance maximale.
- Le chargeur d'un constructeur (Apple, Samsung, Google) n'est proposé que pour ses propres téléphones.

## Pourquoi aucun prix
Les prix changent sans cesse, et le programme Partenaires Amazon n'autorise l'affichage d'un prix que s'il vient de son interface officielle. Le site affiche donc un niveau de prix (€ à €€€) et laisse le prix exact au marchand.

## Sources et vérification
Liste de départ : 83 téléphones (Apple, Samsung, Google, Xiaomi, OnePlus), saisie de mémoire à partir des annonces des constructeurs. **Elle n'a pas été recoupée ligne par ligne avec les fiches officielles : à faire avant l'ouverture au public.**
- Apple : « adaptateur 20 W ou plus » à partir de l'iPhone 12, « 18 W ou plus » de l'iPhone 8 à l'iPhone 11. Apple ne publie pas de puissance maximale ; la valeur saisie est la puissance conseillée.
- Samsung : 25 W ou 45 W en PPS selon le modèle, 15 W sans PPS.
- Google : puissance annoncée par modèle ; la puissance sans PPS n'est pas renseignée.
- Xiaomi, OnePlus : puissance du chargeur de la marque ; les versions vendues en France peuvent différer.

Manquent notamment : la gamme iPhone 17, les Pixel 10, les Galaxy sortis après le début 2025, et les autres marques (Oppo, Honor, Motorola, Nothing…).

## Ajouter un téléphone
1. Relever sur la fiche du constructeur : puissance de charge filaire, type de charge rapide, port.
2. Ajouter l'entrée dans `telephones.json` (identifiant unique, en minuscules avec des tirets).
3. `npm run test` : les tests vérifient les identifiants, la cohérence des puissances, et qu'au moins un chargeur donne la vitesse maximale.
