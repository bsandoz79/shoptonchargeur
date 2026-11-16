/** Identifiant Partenaires Amazon (variable VITE_AMAZON_TAG). Vide : lien simple, sans suivi. */
const TAG: string = (import.meta.env.VITE_AMAZON_TAG ?? '').trim();

/** Lien vers la recherche du marchand, avec l'identifiant d'affiliation s'il est réglé. */
export function lienMarchand(requete: string, tag: string = TAG): string {
  const url = new URL('https://www.amazon.fr/s');
  url.searchParams.set('k', requete);
  if (tag) url.searchParams.set('tag', tag);
  return url.toString();
}
