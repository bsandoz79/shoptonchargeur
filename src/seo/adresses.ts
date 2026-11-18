/**
 * Adresses des pages : une par appareil, lisibles et stables, pour les moteurs de recherche et le partage.
 *   /chargeur/<téléphone>/   /ordinateur/<ordinateur>/   /ordinateur/ (choix)   /guide/
 * Les anciennes adresses (?tel=…, ?pc=…) restent comprises.
 */
export const SITE = 'https://shoptonchargeur.bsandoz.fr';

export const cheminTelephone = (id: string) => `/chargeur/${id}/`;
export const cheminOrdinateur = (id: string) => (id === 'choix' ? '/ordinateur/' : `/ordinateur/${id}/`);
export const CHEMIN_GUIDE = '/guide/';

export interface Adresse { tel?: string; pc?: string; guide?: boolean }

/** Ce que demande l'adresse (chemin et, pour les anciens liens, paramètres). */
export function lireAdresse(pathname: string, search = ''): Adresse {
  const tel = /^\/chargeur\/([a-z0-9-]+)\/?$/.exec(pathname)?.[1];
  if (tel) return { tel };
  if (/^\/ordinateur\/?$/.test(pathname)) return { pc: 'choix' };
  const pc = /^\/ordinateur\/([a-z0-9-]+)\/?$/.exec(pathname)?.[1];
  if (pc) return { pc };
  if (/^\/guide\/?$/.test(pathname)) return { guide: true };
  const params = new URLSearchParams(search);
  return { tel: params.get('tel') ?? undefined, pc: params.get('pc') ?? undefined };
}

/** Chemin d'une adresse. */
export function chemin(a: Adresse): string {
  if (a.tel) return cheminTelephone(a.tel);
  if (a.pc) return cheminOrdinateur(a.pc);
  if (a.guide) return CHEMIN_GUIDE;
  return '/';
}
