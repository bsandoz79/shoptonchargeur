/**
 * Effet de la vitesse de charge sur la batterie, en trois profils. Ce qui use une batterie lithium-ion, c'est surtout la
 * chaleur et un courant fort quand elle est déjà bien remplie : plus la charge est puissante, plus elle chauffe. Les
 * téléphones limitent ces effets (ralentissement au-delà de 80 %, recharge optimisée), mais une charge très puissante,
 * tous les jours, use la batterie un peu plus vite qu'une charge douce. Aucun chiffre d'usure n'est annoncé : il dépend
 * du téléphone, de la température et des habitudes.
 */
export type ProfilBatterie = 'tres-rapide' | 'rapide' | 'douce';

export interface EffetBatterie {
  profil: ProfilBatterie;
  /** Vitesse et ménagement de la batterie, de 1 à 3, pour les jauges. */
  vitesse: 1 | 2 | 3;
  menagement: 1 | 2 | 3;
  titre: string;
  texte: string;
}

/** Seuils en watts obtenus par le téléphone (pas la puissance écrite sur le chargeur). */
export const SEUIL_TRES_RAPIDE_W = 40;
export const SEUIL_RAPIDE_W = 20;

/** Effet d'une charge filaire de `watts` sur la batterie ; `null` si la puissance obtenue n'est pas connue. */
export function effetBatterie(watts: number | null): EffetBatterie | null {
  if (watts === null) return null;
  if (watts >= SEUIL_TRES_RAPIDE_W) {
    return {
      profil: 'tres-rapide', vitesse: 3, menagement: 1, titre: 'Très rapide',
      texte: 'Ça charge en un rien de temps, mais la batterie chauffe plus. À garder pour les jours où tu es pressé.',
    };
  }
  if (watts > SEUIL_RAPIDE_W) {
    return {
      profil: 'rapide', vitesse: 2, menagement: 2, titre: 'Rapide',
      texte: 'Bien plus rapide qu’un vieux chargeur, sans trop faire chauffer la batterie.',
    };
  }
  return {
    profil: 'douce', vitesse: 1, menagement: 3, titre: 'Douce',
    texte: 'Plus lent, mais c’est ce qui ménage le mieux la batterie. Idéal la nuit ou au bureau.',
  };
}

/** La recharge sans fil chauffe plus qu'un câble à puissance égale. */
export function effetSansFil(watts: number | null): EffetBatterie {
  const rapide = watts !== null && watts >= 15;
  return {
    profil: rapide ? 'rapide' : 'douce', vitesse: rapide ? 2 : 1, menagement: 2, titre: rapide ? 'Sans fil rapide' : 'Sans fil',
    texte: 'Pratique, mais une partie de l’énergie se perd en chaleur, donc le téléphone chauffe plus qu’avec un câble. Enlève la coque si elle est épaisse.',
  };
}

/** Conseils pour faire durer la batterie, affichés dans le guide. */
export const CONSEILS_BATTERIE: string[] = [
  'Garde la charge rapide pour quand tu en as vraiment besoin. La nuit, un chargeur de 20 W suffit largement.',
  'Active la recharge optimisée dans les réglages. Le téléphone s’arrête à 80 % et termine juste avant ton réveil.',
  'Évite de le laisser charger au soleil, sous un oreiller ou dans une coque épaisse.',
  'Inutile d’attendre qu’il soit vide. Des petites recharges entre 20 et 80 %, c’est ce qui l’use le moins.',
];
