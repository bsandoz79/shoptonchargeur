import type { Telephone } from './types';

/** « Galaxy S25 Ultra » → gamme « Galaxy S », numéro 25, variante « Ultra ». Sans numéro : le nom entier est la gamme. */
function decouper(modele: string): { gamme: string; numero: number | null; variante: string } {
  const m = /^(.*?)(\d+)(.*)$/.exec(modele);
  if (!m) return { gamme: modele.trim(), numero: null, variante: '' };
  return { gamme: m[1].trim(), numero: Number(m[2]), variante: m[3].trim() };
}

/** Écart entre deux téléphones de la même marque : même gamme d'abord, puis numéro, variante et année proches. */
function ecart(a: Telephone, b: Telephone): number {
  const x = decouper(a.modele);
  const y = decouper(b.modele);
  const numero = x.numero === null || y.numero === null ? 5 : Math.abs(x.numero - y.numero) * 2;
  return (x.gamme === y.gamme ? 0 : 100) + numero + (x.variante === y.variante ? 0 : 1) + Math.abs(a.annee - b.annee);
}

/**
 * Modèles proches d'un téléphone (même marque), du plus proche au moins proche : pour le Galaxy S25 Ultra,
 * les S25 et S25+, puis le S24 Ultra… Liens entre les fiches, utiles aux visiteurs comme aux moteurs de recherche.
 */
export function modelesProches(t: Telephone, telephones: Telephone[], nombre = 5): Telephone[] {
  return telephones
    .filter((autre) => autre.marque === t.marque && autre.id !== t.id)
    .map((autre) => ({ autre, e: ecart(t, autre) }))
    .sort((a, b) => a.e - b.e || a.autre.modele.localeCompare(b.autre.modele, 'fr'))
    .slice(0, nombre)
    .map(({ autre }) => autre);
}
