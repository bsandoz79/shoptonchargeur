import type { Proposition, Telephone } from './types';

/**
 * Pourquoi ce chargeur donne cette vitesse à ce téléphone, en une ou deux phrases. Le texte suit exactement le calcul de
 * `puissanceObtenue` : même règle, dite simplement.
 */
export function pourquoi(t: Telephone, p: Proposition): string {
  const c = p.chargeur;
  const marge = c.puissanceW > t.puissanceMaxW
    ? ` Il peut sortir ${c.puissanceW} W, mais ton téléphone n’en prendra que ${t.puissanceMaxW}. Aucun risque.`
    : '';

  if (t.protocole === 'proprietaire') {
    if (c.origineDe === t.marque) {
      return `C’est le chargeur ${t.marque}, le seul compatible ${t.techno}. Sans lui, pas de ${t.puissanceMaxW} W.`;
    }
    return `Il n’est pas compatible ${t.techno}, la charge rapide de ${t.marque}. Ton téléphone charge quand même, en USB-C classique, mais moins vite.`;
  }

  if (t.protocole === 'pd') {
    if (p.maximale) {
      return `Il est en Power Delivery, comme ton téléphone, donc ils se calent tout seuls sur la bonne puissance.${marge || ` Ses ${c.puissanceW} W suffisent pour charger à fond.`}`;
    }
    return `Il est bien en Power Delivery, mais il s’arrête à ${c.puissanceW} W alors que ton téléphone peut monter à ${t.puissanceMaxW} W.`;
  }

  // PPS
  if (!c.ppsMaxW) {
    return t.puissanceSansProtocoleW
      ? `Il n’a pas le PPS, et ton téléphone en a besoin pour charger vite. Il plafonne donc à ${p.puissanceObtenueW} W.`
      : 'Il n’a pas le PPS, et ton téléphone en a besoin pour charger vite. Ça marche, mais plus lentement.';
  }
  if (t.cable5A && !c.pps5A && !p.maximale) {
    return `Il a le PPS, mais pas assez de courant pour les ${t.puissanceMaxW} W de ton téléphone (il faut du 5 A). Tu restes à ${p.puissanceObtenueW} W.`;
  }
  if (p.maximale) {
    return `Il a le PPS, ce réglage qui laisse ton téléphone ajuster la tension en continu. C’est ce qu’il faut pour ses ${t.puissanceMaxW} W.${marge}`;
  }
  return `Il a le PPS, mais jusqu’à ${c.ppsMaxW} W seulement. Ton téléphone pourrait aller à ${t.puissanceMaxW} W.`;
}

/** Les questions du guide, dans l'ordre où on se les pose. */
export const GUIDE: { question: string; reponse: string }[] = [
  {
    question: 'À quoi servent les watts ?',
    reponse: 'Plus il y a de watts, plus la batterie se remplit vite. Mais c’est le téléphone qui décide de ce qu’il prend. Un chargeur de 65 W branché sur un téléphone de 20 W donnera 20 W, sans rien abîmer. Dans l’autre sens, un petit chargeur sur un gros téléphone fonctionne aussi, simplement plus lentement.',
  },
  {
    question: 'Comment le chargeur et le téléphone se mettent-ils d’accord ?',
    reponse: 'Ils échangent quelques informations dès que tu branches le câble. Sans accord, le chargeur reste à 5 volts et la charge est lente. Pour aller plus vite, il faut une norme commune, et en USB-C c’est le Power Delivery (PD). Presque tous les téléphones récents le gèrent.',
  },
  {
    question: 'C’est quoi, le PPS ?',
    reponse: 'Une option du Power Delivery. Au lieu de quelques tensions fixes (5, 9, 15 ou 20 volts), le téléphone règle lui-même la tension au plus juste, en continu. Il chauffe moins et charge plus vite. Les Galaxy et les Pixel en ont besoin pour leur vitesse maximale.',
  },
  {
    question: 'Pourquoi certaines marques veulent leur propre chargeur ?',
    reponse: 'Xiaomi, OnePlus, OPPO et quelques autres ont développé leur propre charge rapide (HyperCharge, SUPERVOOC…), qui monte à 67, 100 ou 120 W. Elle ne marche qu’avec leurs chargeurs. Avec un autre chargeur USB-C, le téléphone charge en Power Delivery, plus doucement.',
  },
  {
    question: 'Le câble a-t-il de l’importance ?',
    reponse: 'Oui, toute la puissance passe par lui. Un câble USB-C classique est limité à 3 ampères, donc 60 W. Pour les 45 W des Galaxy ou pour un ordinateur, prends un câble 5 A (souvent vendu 100 W ou 240 W). Un vieux câble peut aussi brider la charge sans que tu t’en rendes compte.',
  },
  {
    question: 'Pourquoi la charge ralentit-elle à la fin ?',
    reponse: 'C’est normal. Une batterie vide accepte beaucoup de courant, une batterie presque pleine beaucoup moins. Le téléphone ralentit donc de lui-même pour la protéger. Les 25 ou 45 W annoncés concernent le début de la charge, et c’est là qu’un bon chargeur fait la différence.',
  },
  {
    question: 'Pourquoi une prise française ?',
    reponse: 'On trouve aussi sur Amazon des versions anglaises (trois broches) ou américaines (broches plates), parfois moins chères. Elles ne rentrent pas dans une prise française, et un adaptateur de voyage n’arrange rien. On ne te propose que des versions européennes. Sur la fiche, regarde le type de prise (C, E ou F) ou une référence qui finit par EU.',
  },
  {
    question: 'C’est quoi, un chargeur GaN ?',
    reponse: 'GaN, c’est le nitrure de gallium, un composant qui remplace le silicium dans les chargeurs récents. Il chauffe moins, donc le chargeur peut être plus petit. Un 65 W GaN fait à peu près la taille d’un ancien chargeur de téléphone.',
  },
  {
    question: 'Un chargeur d’ordinateur peut-il recharger mon téléphone ?',
    reponse: 'Oui, s’il est en USB-C. Le téléphone ne prendra que ce dont il a besoin. Un 65 W ou un 100 W peut donc servir pour l’ordinateur, la tablette et le téléphone. Pour un Galaxy ou un Pixel, vérifie juste qu’il a aussi le PPS.',
  },
];

/** Les explications illustrées du guide. */
export const ESSENTIELS: { id: string; titre: string; forme: 'cube' | 'cable' | 'gan' | 'compact'; points: string[] }[] = [
  {
    id: 'bloc',
    titre: 'Comment marche un bloc',
    forme: 'cube',
    points: [
      'Il prend le 230 volts de la prise et le descend à 5, 9, 15 ou 20 volts, ce que ton téléphone supporte.',
      'Un transformateur sépare la prise de ton téléphone. En cas de panne, c’est lui qui te protège.',
      'Une petite puce s’entend avec le téléphone sur la bonne tension, puis la surveille tant qu’il charge.',
      'Les blocs GaN chauffent moins, ce qui permet de les faire deux fois plus petits à puissance égale.',
    ],
  },
  {
    id: 'cable',
    titre: 'Comment marche un câble',
    forme: 'cable',
    points: [
      'Il transporte le courant, mais aussi l’échange entre le bloc et le téléphone. Avec un mauvais câble, la charge rapide peut ne pas se déclencher.',
      'Tout dépend de l’épaisseur des fils. Un câble USB-C classique tient 3 ampères, soit 60 W.',
      'Au-delà (Galaxy en 45 W, ordinateurs), il faut un câble 5 A. Il contient une petite puce qui indique au chargeur qu’il peut monter plus haut.',
      'Pour un iPhone en Lightning, prends un câble certifié MFi. Les autres risquent de ne plus marcher après une mise à jour.',
      'Côté longueur, 1 m suffit au bureau ou en voiture, 2 m c’est pratique au lit ou dans le canapé, et 3 m seulement si la prise est vraiment loin. Un câble plus long ne charge pas plus vite et s’abîme plus facilement.',
    ],
  },
  {
    id: 'batterie',
    titre: 'Charge rapide et batterie',
    forme: 'compact',
    points: [
      'Ton téléphone peut charger très vite, mais ça a un prix. Ce qui use une batterie, c’est surtout la chaleur, et une charge puissante chauffe plus.',
      'Les téléphones limitent les dégâts. Ils chargent fort au début puis ralentissent après 80 %, quand la batterie supporte moins bien le courant.',
      'Une charge très rapide de temps en temps, aucun souci. Tous les jours, la batterie perdra sa capacité un peu plus vite qu’avec une charge douce.',
      'C’est pour ça qu’on indique trois niveaux sur chaque chargeur : très rapide à partir de 40 W, rapide entre 21 et 39 W, doux à 20 W et moins. Le sans fil, lui, chauffe plus qu’un câble.',
    ],
  },
  {
    id: 'camelote',
    titre: 'Pourquoi éviter les chargeurs à 5 €',
    forme: 'gan',
    points: [
      'Un chargeur sans marque très bon marché fait des économies là où ça ne se voit pas, sur l’isolation et les protections contre la surchauffe.',
      'Au mieux, la charge est instable et la batterie s’use plus vite. Au pire, le bloc surchauffe, avec un vrai risque d’incendie ou d’électrocution.',
      'Le logo CE n’est pas une garantie. C’est le fabricant qui se l’attribue, et il est souvent copié.',
      'Les grandes marques testent leurs chargeurs, publient leurs caractéristiques et les garantissent. On ne te propose que celles-là.',
    ],
  },
];
