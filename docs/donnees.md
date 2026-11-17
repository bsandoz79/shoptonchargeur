# Données

Trois fichiers JSON dans `src/data/`. Les types sont décrits dans `src/moteur/types.ts`.

| Fichier | Contenu | Mise à jour |
| --- | --- | --- |
| `catalogue.json` | les iPhone et les téléphones Android à port USB-C : marque, nom, références de modèle (1 566 au 17/11/2026) | automatique : `npm run catalogue` |
| `ordinateurs.json`, `chargeurs-ordinateur.json` | ordinateurs portables rechargés en USB-C et leurs chargeurs | à la main |
| `telephones.json` | les fiches de charge vérifiées (83) | à la main |
| `chargeurs.json` | les chargeurs conseillés (10) | à la main |

## `catalogue.json` : tous les téléphones
Construit par `scripts/catalogue.mjs` à partir de la **liste officielle des appareils Android de Google** (`supported_devices.csv`, publiée pour les développeurs) : nom commercial et références de modèle de 23 marques. Le script écarte tablettes, montres, téléviseurs et ordinateurs. Les iPhone, absents de cette liste, sont ajoutés dans le script.

**Seulement l'USB-C et les iPhone.** La liste Google ne donne pas le port. Le script garde donc les gammes connues pour être en USB-C, reconnues par leur nom (table `USB_C` du script) : par exemple les Galaxy S8 et suivants, A11 à A99, tous les Pixel, tous les noms contenant « 5G ». Les règles sont prudentes : une gamme douteuse (entrée de gamme encore en micro-USB) est écartée. Elles restent une approximation : quelques modèles micro-USB peuvent passer, et quelques modèles USB-C manquer. Pour ajouter une gamme, compléter la table puis relancer `npm run catalogue`.

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

## Recharge sans fil
`telephones.json`, champ `sansFil` : `false` (pas de recharge sans fil), ou `{ norme, maxW? }` avec `magsafe` (iPhone 12 et suivants, sauf 16e) ou `qi`. `maxW` seulement quand il est sûr : iPhone 16 25 W, iPhone 12 à 15 15 W (mini 12 W), Qi des iPhone 7,5 W. Pour les Android, la puissance sans fil n'est pas renseignée : le site n'annonce pas de vitesse.

`chargeurs-sans-fil.json` : norme (`magsafe`, `qi2` magnétique, `qi`), puissance, bloc secteur à associer (`adaptateurW`), `reservePixel`. Règles dans `src/moteur/sansFil.ts`.

À recouper avant l'ouverture : quels Galaxy, Pixel, Xiaomi et OnePlus ont la recharge sans fil (valeurs saisies de mémoire), et les noms exacts des chargeurs sans fil.

## Rapport qualité/prix
`src/moteur/qualitePrix.ts`. Notre évaluation, affichée comme telle (infobulle) : 2 points pour la vitesse maximale sur l'appareil (1 si au moins 60 %), 1 point pour un chargeur de constructeur, 2 points pour un petit prix (1 pour un prix moyen). 4 et plus : Excellent ; 3 : Très bon ; 2 : Bon ; moins : Moyen. Ce n'est jamais une note d'acheteurs (le site n'en affiche aucune).

## Visuels
Pas de photos : celles des marchands et des marques ne peuvent pas être reprises sans autorisation. Chaque produit a un champ `forme` et `teinte`, dessiné par `src/components/Illustration.tsx`. Pour de vraies photos plus tard : celles fournies par l'interface officielle d'Amazon (réservée aux partenaires actifs) ou par les marques.

## Ordinateurs portables
`ordinateurs.json` : `besoinW` est la puissance du chargeur d'origine, `rapideW` celle qui déclenche la recharge rapide quand elle est connue. Les entrées `generique` sont des choix par puissance (« PC portable avec chargeur de 65 W »), pas des modèles : aucune base ne donne la puissance de tous les PC, et elle est écrite sur le chargeur d'origine.

Règle (`src/moteur/ordinateur.ts`) : chargeur d'au moins `besoinW` → recharge normale ; d'au moins `rapideW` → recharge rapide ; en dessous → « Trop faible : recharge lente », classé en dernier. Les chargeurs Apple ne sont proposés que pour les Mac.

Modèles nommés (relevés le 17/11/2026 sur les fiches des fabricants) : MacBook Air 13 M4 (30 ou 35 W, recharge rapide avec 70 W), Air 15 M4 (35 W, 70 W en rapide), MacBook Pro 14 M4 (70 W) et M4 Pro (96 W), ThinkPad X1 Carbon Gen 12 (65 W, PSREF Lenovo), Dell XPS 13 9340 (60 W, manuel Dell), Framework Laptop 13 (60 W), Galaxy Book4 Pro 14 (65 W, fiche Samsung). MacBook Air M1 (30 W) et MacBook Pro 16 (140 W) de mémoire. HP et ASUS non ajoutés faute de source fiable : n'ajouter un modèle qu'avec la fiche du fabricant.

À recouper avant l'ouverture : les puissances des MacBook (Air : 30 W, rapide à 70 W ; Pro 14 pouces : 70 W, rapide à 96 W ; Pro 16 pouces : 140 W) et les chargeurs de `chargeurs-ordinateur.json` (noms, nombre de ports), saisis de mémoire.

### Séries et prises (ajout du 17/11/2026)
Champs : `prise` (`usb-c`, `ronde`, `rectangulaire`, `surface`), `plageW` (puissances selon la configuration), `etiquette` (trop variable : lire l'étiquette), `magsafe`, `chargeurOrigine` (nom et recherche), `note`. Sources : PSREF et boutique Lenovo (Legion 230 à 300 W embout rectangulaire, X1 Carbon 65 W USB-C, IdeaPad Slim 5 65 à 100 W USB-C), manuels Dell (Latitude 45 à 90 W en 4,5 mm ou USB-C, G5 15 130 ou 180 W en 7,4 mm), guide HP (65 W, 90 W avec carte graphique, embout 4,5 mm Smart), assistance Microsoft (Surface Pro 11e édition 39 W, 60 W conseillés), fiches de revendeurs pour HP Victus (150 ou 200 W) et ASUS TUF/ROG (150 à 240 W). Acer, MSI, HP Omen et Dell G15 : pas de source fiable sur la puissance, d'où le renvoi à l'étiquette. Ces séries regroupent des modèles différents : la note de chaque entrée le rappelle.

## Explications
`src/moteur/explications.ts` : `pourquoi()` écrit la phrase « Pourquoi ? » de chaque chargeur à partir du même cas que `puissanceObtenue()` ; toute nouvelle règle de calcul doit y avoir sa phrase. `GUIDE` contient les questions du guide en bas de page.

## Recherche
`src/moteur/recherche.ts`. Chaque mot saisi doit commencer un mot de la marque ou du modèle. Ordre des résultats : le nom exact ; puis les modèles dont chaque mot saisi est un mot entier ou le début d'un numéro (« s » trouve « S25 », pas « Sidekick ») ; puis les autres. À égalité : grandes marques d'abord, numéros décroissants (S26, S25, S24…), iPhone par année. 30 résultats au plus.

## Liens directs (ASIN) et version française
Champ `asin` des chargeurs : identifiant de la page Amazon.fr du produit, relevé à la main le 17/11/2026 sur les fiches vendues par la marque ou par Amazon (pas les copies). **Seulement si la fiche confirme la prise française** (type C, E ou F, ou référence européenne) : Apple 40 W, Samsung 25 W (« version FR »), Google 30 W (GA02275-EU), Belkin 30 W (WCA005vf), Anker Nano 30 W (prise type C, AnkerDirect FR), UGREEN 45 W (prise type E), Pixel Stand (GA03002-EU). Sinon, recherche sur la référence européenne (Apple « MHJE3ZM/A », Samsung « EP-T4510XBEGEU ») ou avec « prise européenne » ; un test le vérifie. Champ `prise: 'fr'` sur tous les chargeurs secteur. Les chargeurs sans fil MagSafe, Qi2 et tapis n'ont pas de prise (câble USB-C seul). Sans ASIN, le lien mène à une recherche. Une page peut disparaître ou changer de vendeur : vérifier les liens de temps en temps.

## Priorités d'achat
`src/moteur/selection.ts` : 1. conseillé par le constructeur (chargeur de la marque, ou d'origine, qui donne la vitesse maximale, le moins puissant) ; 2. meilleur rapport qualité/prix parmi les autres (barème de `qualitePrix`, vitesse maximale exigée s'il y en a, puis le moins cher) ; 3. les autres, dans l'ordre du tri.

## Pourquoi aucun prix ni photo
Les prix changent sans cesse, et le programme Partenaires Amazon n'autorise l'affichage d'un prix ou d'une photo de produit que s'ils viennent de son interface officielle (Product Advertising API), mis à jour au moins toutes les 24 heures. Cette interface s'ouvre après l'inscription au programme et les premières ventes. Prochaine étape : une tâche quotidienne (GitHub Actions) qui interroge l'API et publie prix et photos avec leur heure de relevé. Le site affiche donc un niveau de prix (€ à €€€) et laisse le prix exact au marchand.

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
