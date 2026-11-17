import type { Proposition, Telephone } from './types';

/**
 * Pourquoi ce chargeur donne cette vitesse à ce téléphone, en une ou deux phrases. Le texte suit exactement le calcul de
 * `puissanceObtenue` : même règle, dite en clair.
 */
export function pourquoi(t: Telephone, p: Proposition): string {
  const c = p.chargeur;
  const marge = c.puissanceW > t.puissanceMaxW
    ? ` Il peut fournir jusqu’à ${c.puissanceW} W, mais c’est le téléphone qui décide : il n’en prend que ${t.puissanceMaxW}, sans aucun risque.`
    : '';

  if (t.protocole === 'proprietaire') {
    if (c.origineDe === t.marque) {
      return `C’est le chargeur de ${t.marque} : le seul à parler ${t.techno}, la charge rapide maison. Lui seul débloque les ${t.puissanceMaxW} W.`;
    }
    return `Ce chargeur ne parle pas ${t.techno}, la charge rapide de ${t.marque}. Le téléphone se rabat sur la charge USB-C standard : ça marche, sans danger, mais plus lentement.`;
  }

  if (t.protocole === 'pd') {
    if (p.maximale) {
      return `Ton téléphone et ce chargeur parlent tous les deux le « Power Delivery » : ils s’accordent sur la puissance dès le branchement.${marge || ` Ses ${c.puissanceW} W couvrent tout ce que le téléphone accepte.`}`;
    }
    return `Ils parlent tous les deux le « Power Delivery », mais ce chargeur plafonne à ${c.puissanceW} W : ton téléphone en accepterait ${t.puissanceMaxW}.`;
  }

  // PPS
  if (!c.ppsMaxW) {
    return t.puissanceSansProtocoleW
      ? `Ce chargeur n’a pas le « PPS », le réglage fin dont ton téléphone a besoin pour charger vite. Il se rabat sur le Power Delivery simple : ${p.puissanceObtenueW} W.`
      : 'Ce chargeur n’a pas le « PPS », le réglage fin dont ton téléphone a besoin pour charger vite. Il se rabat sur le Power Delivery simple, plus lent.';
  }
  if (t.cable5A && !c.pps5A && !p.maximale) {
    return `Il a bien le « PPS », mais pas avec assez de courant (5 A) pour les ${t.puissanceMaxW} W de ton téléphone : la charge s’arrête à ${p.puissanceObtenueW} W.`;
  }
  if (p.maximale) {
    return `Ce chargeur a le « PPS » : ton téléphone lui demande, en continu, exactement la tension qu’il lui faut. C’est ce qui débloque ses ${t.puissanceMaxW} W.${marge}`;
  }
  return `Il a bien le « PPS », mais seulement jusqu’à ${c.ppsMaxW} W : ton téléphone en accepterait ${t.puissanceMaxW}.`;
}

/** Les notions à connaître, dans l'ordre où on se pose les questions. Affichées dans le guide du site. */
export const GUIDE: { question: string; reponse: string }[] = [
  {
    question: 'À quoi servent les watts ?',
    reponse: 'Les watts (W), c’est la vitesse de recharge : plus il y en a, plus la batterie se remplit vite. Mais c’est le téléphone qui commande : il annonce ce qu’il accepte et ne prend jamais plus. Un chargeur de 65 W sur un téléphone de 20 W charge donc à 20 W, sans l’abîmer. L’inverse est vrai aussi : un petit chargeur sur un gros téléphone marche, mais lentement.',
  },
  {
    question: 'Comment le chargeur et le téléphone se mettent-ils d’accord ?',
    reponse: 'Au branchement, ils discutent par le câble. Par défaut, un chargeur ne donne que 5 volts, lentement. Pour aller plus vite, les deux doivent parler la même « langue » de charge rapide. La langue commune de l’USB-C s’appelle « Power Delivery » (PD) : presque tous les téléphones récents la comprennent. S’ils n’ont aucune langue rapide en commun, la recharge se fait quand même, à vitesse lente.',
  },
  {
    question: 'C’est quoi, le PPS ?',
    reponse: 'Le PPS est une option du Power Delivery. Au lieu de choisir entre quelques tensions fixes (5, 9, 15, 20 volts), le téléphone demande la tension exacte qu’il lui faut et l’ajuste en permanence. Résultat : moins de chaleur, donc une charge plus rapide. Les Samsung Galaxy et les Google Pixel en ont besoin pour atteindre leur vitesse maximale. Sans PPS, ils chargent, mais nettement moins vite.',
  },
  {
    question: 'Pourquoi certaines marques veulent leur propre chargeur ?',
    reponse: 'Xiaomi, OnePlus, OPPO et quelques autres ont leur propre charge rapide (HyperCharge, SUPERVOOC…), souvent très puissante : 67, 100, 120 W. Seul un chargeur de la marque parle cette langue. Avec un chargeur USB-C d’une autre marque, le téléphone se rabat sur le Power Delivery, plus lent, mais sans danger.',
  },
  {
    question: 'Le câble a-t-il de l’importance ?',
    reponse: 'Oui : toute la puissance passe par lui. Un câble USB-C ordinaire laisse passer 3 ampères, soit 60 W au plus. Au-delà (et pour les 45 W des Galaxy), il faut un câble « 5 A », souvent vendu « 100 W » ou « 240 W ». Un vieux câble ou un câble bas de gamme peut brider la charge sans que rien ne l’indique.',
  },
  {
    question: 'Pourquoi la charge ralentit-elle à la fin ?',
    reponse: 'C’est voulu. Une batterie accepte beaucoup de courant quand elle est vide, de moins en moins en se remplissant. Le téléphone ralentit donc tout seul vers la fin pour la protéger. Les puissances annoncées (25 W, 45 W…) valent pour le début de la recharge : c’est là qu’un bon chargeur fait gagner du temps.',
  },
  {
    question: 'Pourquoi « prise française » ?',
    reponse: 'Amazon vend aussi des versions anglaises (prise à trois broches rectangulaires) ou américaines (deux broches plates), parfois moins chères : elles ne rentrent pas dans une prise française, et un adaptateur de voyage ajoute un point faible. Tous les chargeurs proposés ici sont des versions européennes, à deux broches rondes. Sur la fiche du produit, vérifie « Type de prise : C, E ou F » ou une référence se terminant par « EU ».',
  },
  {
    question: 'C’est quoi, un chargeur « GaN » ?',
    reponse: 'GaN désigne le composant qui remplace le silicium dans les chargeurs récents. Il chauffe moins : à puissance égale, le chargeur est plus petit et plus léger. C’est ce qui permet un chargeur de 65 W de la taille d’un ancien chargeur de téléphone.',
  },
  {
    question: 'Un chargeur d’ordinateur peut-il recharger mon téléphone ?',
    reponse: 'Oui, s’il est en USB-C. Il parle le Power Delivery, et le téléphone ne prend que ce qu’il lui faut. Un chargeur de 65 W ou 100 W peut ainsi recharger l’ordinateur, la tablette et le téléphone. Pour la vitesse maximale d’un Galaxy ou d’un Pixel, vérifie simplement qu’il a aussi le PPS.',
  },
];

/** Les trois explications illustrées du guide : le bloc, le câble, et pourquoi éviter l'entrée de gamme douteuse. */
export const ESSENTIELS: { id: string; titre: string; forme: 'cube' | 'cable' | 'gan' | 'compact'; points: string[] }[] = [
  {
    id: 'bloc',
    titre: 'Comment fonctionne un bloc',
    forme: 'cube',
    points: [
      'Le bloc transforme le 230 volts de la prise en une basse tension que le téléphone supporte : 5, 9, 15 ou 20 volts.',
      'À l’intérieur, un transformateur sépare la prise de ton téléphone : c’est lui qui t’évite de recevoir le secteur en cas de défaut.',
      'Une petite puce discute avec le téléphone (Power Delivery, PPS) pour choisir la bonne tension, puis la surveille en permanence.',
      'Les blocs « GaN » utilisent un composant qui chauffe moins : même puissance, bloc deux fois plus petit.',
    ],
  },
  {
    id: 'cable',
    titre: 'Comment fonctionne un câble',
    forme: 'cable',
    points: [
      'Le câble transporte le courant, et aussi la conversation entre le bloc et le téléphone : un mauvais câble peut faire échouer la charge rapide.',
      'La puissance dépend de l’épaisseur des fils. Un câble USB-C ordinaire est fait pour 3 ampères, soit 60 W au plus.',
      'Au-delà (45 W des Galaxy, ordinateurs), il faut un câble « 5 A » avec une puce d’identification (« e-marker ») qui annonce qu’il tient la charge.',
      'Pour un iPhone à port Lightning, préfère un câble certifié « MFi » par Apple : les autres peuvent s’arrêter de fonctionner après une mise à jour.',
      'La longueur : 1 m pour le bureau, la voiture ou le sac ; 2 m pour charger au lit ou dans le canapé ; 3 m seulement si la prise est loin. Plus long, c’est plus encombrant et plus fragile, sans charger plus vite.',
    ],
  },
  {
    id: 'batterie',
    titre: 'Charge rapide et batterie : à quel prix ?',
    forme: 'compact',
    points: [
      'Oui, ton téléphone peut charger très vite. Mais ce qui use une batterie, c’est surtout la chaleur, et une charge puissante chauffe davantage.',
      'Les téléphones se protègent : ils chargent fort au début, puis ralentissent au-delà de 80 %, quand la batterie supporte moins bien le courant.',
      'Une charge très rapide de temps en temps ne pose aucun problème. Tous les jours, la batterie perd sa capacité un peu plus vite qu’avec une charge douce.',
      'D’où nos trois niveaux sur chaque chargeur : très rapide (40 W et plus), rapide (de 21 à 39 W), douce (20 W et moins). Le sans fil, lui, chauffe plus qu’un câble à puissance égale.',
    ],
  },
  {
    id: 'camelote',
    titre: 'Pourquoi éviter les chargeurs premier prix',
    forme: 'gan',
    points: [
      'Un chargeur sans marque à quelques euros économise d’abord sur ce qui ne se voit pas : l’isolation entre la prise et le câble, et les protections contre la surchauffe.',
      'Résultat possible : une charge instable qui use la batterie plus vite, un bloc qui chauffe fort, et dans le pire des cas un risque d’incendie ou d’électrocution.',
      'Le logo « CE » ne prouve rien : c’est une déclaration du fabricant lui-même, souvent imitée.',
      'Les marques sérieuses conçoivent et testent leurs chargeurs, publient leurs caractéristiques et les garantissent. C’est pour ça qu’on ne te propose qu’elles.',
    ],
  },
];
