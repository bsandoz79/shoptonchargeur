import { describe, expect, it } from 'vitest';
import { surveillerApparitions } from './effets';

describe('apparitions au défilement', () => {
  it('ne cache rien sans IntersectionObserver ni matchMedia (navigateur ancien, robot)', () => {
    const racine = document.createElement('div');
    racine.innerHTML = '<p data-apparait>Texte</p>';
    const arreter = surveillerApparitions(racine);
    expect(document.documentElement.classList.contains('effets')).toBe(false);
    arreter();
  });
});
