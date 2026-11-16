import { normaliser } from '../moteur/recherche';
import type { Appareil, Chargeur, Telephone } from '../moteur/types';
import chargeurs from './chargeurs.json';
import telephones from './telephones.json';

/** Téléphones à fiche de charge vérifiée : chargés avec la page. */
export const TELEPHONES = telephones as Telephone[];
export const CHARGEURS = chargeurs as Chargeur[];

/**
 * Tous les téléphones : les fiches vérifiées, puis le catalogue complet (nom et références, sans données de charge),
 * chargé à part pour ne pas alourdir l'ouverture de la page. Les références du catalogue complètent celles des fiches
 * vérifiées, pour la détection.
 */
export async function chargerCatalogue(): Promise<Appareil[]> {
  const lignes = (await import('./catalogue.json')).default as unknown as [string, string, string[], number?][];
  const verifies = new Map(TELEPHONES.map((t) => [normaliser(`${t.marque} ${t.modele}`), t]));
  const ids = new Set(TELEPHONES.map((t) => t.id));
  const autres: Appareil[] = [];
  for (const [marque, modele, codes, annee] of lignes) {
    const cle = normaliser(`${marque} ${modele}`);
    const verifie = verifies.get(cle);
    if (verifie) { verifie.codes = [...new Set([...(verifie.codes ?? []), ...codes])]; continue; }
    const id = cle.replace(/ /g, '-');
    if (!id || ids.has(id)) continue;
    ids.add(id);
    autres.push({ id, marque, modele, ...(codes.length ? { codes } : {}), ...(annee ? { annee } : {}) });
  }
  return [...TELEPHONES, ...autres];
}
