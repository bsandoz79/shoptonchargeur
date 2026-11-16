# Chope ton chargeur

Outil web qui associe un téléphone à son chargeur : puissance acceptée (watts), type de charge rapide (Power Delivery, PPS, charge propre à la marque), port et câble. Les chargeurs proposés mènent au marchand par des liens d'affiliation. Aucun stock, aucune vente directe.

Adresse prévue : https://choptonchargeur.bsandoz.fr

## Démarrer
```bash
npm install
npm run test    # tests du moteur et de l'interface
npm run lint    # analyse du code
npm run build   # version de production dans dist/
```

## Comment ça marche
1. **Identification** : le navigateur annonce parfois le modèle (Android). S'il est reconnu, il est proposé d'un clic. Un iPhone n'annonce jamais son modèle : on propose alors la liste des iPhone. Sinon, recherche par marque et modèle.
2. **Compatibilité** : `src/moteur/compatibilite.ts` calcule, pour chaque chargeur, la puissance réellement obtenue par le téléphone, puis trie (vitesse, puissance, prix, fiabilité).
3. **Affiliation** : `src/moteur/affiliation.ts` construit le lien vers la recherche Amazon, avec l'identifiant partenaire s'il est réglé.

## Organisation
| Dossier | Contenu |
| --- | --- |
| `src/data/` | `telephones.json` et `chargeurs.json` : les seules données à tenir à jour |
| `src/moteur/` | logique pure et testée : compatibilité, recherche, détection, liens |
| `src/components/` | recherche, fiche du téléphone, liste des chargeurs, icônes |
| `src/styles/` | variables de design (`tokens.css`) et styles communs |
| `docs/` | données (format, sources, vérifications), mise en ligne, journal |

## Réglages
`VITE_AMAZON_TAG` : identifiant Partenaires Amazon (ex. `monsite-21`). En local dans `.env.local` (non versionné), en production dans les variables du dépôt GitHub. Vide : les liens fonctionnent, sans suivi.

## À faire avant l'ouverture au public
Voir `docs/mise-en-ligne.md` : vérification des données, compte Partenaires Amazon, mentions légales, sous-domaine.
