import { TELEPHONES } from '../data';
import { modelesProches } from './proches';

const tel = (id: string) => TELEPHONES.find((t) => t.id === id)!;

describe('modèles proches', () => {
  it('même marque, même gamme d’abord : S25 et S25+ pour le S25 Ultra, puis le S24 Ultra', () => {
    const noms = modelesProches(tel('samsung-galaxy-s25-ultra'), TELEPHONES).map((t) => t.modele);
    expect(noms.slice(0, 2).sort()).toEqual(['Galaxy S25', 'Galaxy S25+']);
    expect(noms[2]).toBe('Galaxy S24 Ultra');
    expect(noms).not.toContain('Galaxy S25 Ultra');
  });

  it('jamais une autre marque, 5 au plus', () => {
    const proches = modelesProches(tel('apple-iphone-17-pro-max'), TELEPHONES);
    expect(proches.length).toBeLessThanOrEqual(5);
    expect(proches.every((t) => t.marque === 'Apple')).toBe(true);
  });
});
