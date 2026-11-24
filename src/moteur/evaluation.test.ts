import { describe, expect, it } from 'vitest';
import { evaluer } from './evaluation';

describe('note en couleur d’un chargeur', () => {
  it('vitesse maximale et bon équilibre : Idéal ; vitesse maximale seule : Très bon', () => {
    expect(evaluer(1, 3, 3)).toBe('ideal');
    expect(evaluer(1, 2, 2)).toBe('ideal');
    expect(evaluer(1, 2, 3)).toBe('tresbon');
  });
  it('pas la vitesse maximale : Compatible ; moins de la moitié : Charge lente', () => {
    expect(evaluer(25 / 45, 2, 1)).toBe('compatible');
    expect(evaluer(15 / 45, 3, 1)).toBe('lent');
  });
  it('vitesse inconnue (fiche non vérifiée) : Compatible', () => {
    expect(evaluer(null, 3, 1)).toBe('compatible');
  });
});
