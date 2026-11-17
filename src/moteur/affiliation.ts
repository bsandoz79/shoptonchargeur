/** Identifiant Partenaires Amazon (variable VITE_AMAZON_TAG). Vide : lien simple, sans suivi. */
const TAG: string = (import.meta.env.VITE_AMAZON_TAG ?? '').trim();

/** Page d'un produit Amazon (par son identifiant ASIN), avec l'identifiant d'affiliation s'il est réglé. */
export function lienAmazon(asin: string, tag: string = TAG): string {
  const url = new URL(`https://www.amazon.fr/dp/${encodeURIComponent(asin)}`);
  if (tag) url.searchParams.set('tag', tag);
  return url.toString();
}

/** Lien vers la recherche du marchand, avec l'identifiant d'affiliation s'il est réglé. */
export function lienMarchand(requete: string, tag: string = TAG): string {
  const url = new URL('https://www.amazon.fr/s');
  url.searchParams.set('k', requete);
  if (tag) url.searchParams.set('tag', tag);
  return url.toString();
}
