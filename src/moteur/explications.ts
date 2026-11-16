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
    question: 'C’est quoi, un chargeur « GaN » ?',
    reponse: 'GaN désigne le composant qui remplace le silicium dans les chargeurs récents. Il chauffe moins : à puissance égale, le chargeur est plus petit et plus léger. C’est ce qui permet un chargeur de 65 W de la taille d’un ancien chargeur de téléphone.',
  },
  {
    question: 'Un chargeur d’ordinateur peut-il recharger mon téléphone ?',
    reponse: 'Oui, s’il est en USB-C. Il parle le Power Delivery, et le téléphone ne prend que ce qu’il lui faut. Un chargeur de 65 W ou 100 W peut ainsi recharger l’ordinateur, la tablette et le téléphone. Pour la vitesse maximale d’un Galaxy ou d’un Pixel, vérifie simplement qu’il a aussi le PPS.',
  },
];
