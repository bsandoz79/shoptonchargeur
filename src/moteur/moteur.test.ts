import { CHARGEURS, TELEPHONES } from '../data';
import { lienMarchand } from './affiliation';
import { chargeurOrigine, proposer, puissanceObtenue } from './compatibilite';
import { analyser, modeleDepuisUA, trouverParModele } from './detection';
import { chercher, normaliser } from './recherche';

const tel = (id: string) => TELEPHONES.find((t) => t.id === id)!;
const chargeur = (id: string) => CHARGEURS.find((c) => c.id === id)!;

describe('données', () => {
  it('identifiants uniques, puissances et protocoles cohérents', () => {
    expect(new Set(TELEPHONES.map((t) => t.id)).size).toBe(TELEPHONES.length);
    expect(new Set(CHARGEURS.map((c) => c.id)).size).toBe(CHARGEURS.length);
    for (const t of TELEPHONES) {
      expect(t.puissanceMaxW, t.id).toBeGreaterThan(0);
      if (t.protocole === 'proprietaire') expect(t.techno, t.id).toBeTruthy();
      if (t.puissanceSansProtocoleW !== undefined) expect(t.puissanceSansProtocoleW, t.id).toBeLessThan(t.puissanceMaxW);
    }
    for (const c of CHARGEURS) {
      if (c.ppsMaxW) expect(c.protocoles, c.id).toContain('pps');
      expect(c.ppsMaxW ?? 0, c.id).toBeLessThanOrEqual(c.puissanceW);
    }
  });

  it('chaque téléphone a au moins un chargeur qui le charge à sa vitesse maximale', () => {
    for (const t of TELEPHONES) expect(proposer(t, CHARGEURS)[0].maximale, t.id).toBe(true);
  });
});

describe('puissance obtenue', () => {
  it('Power Delivery : le plus petit des deux, téléphone ou chargeur', () => {
    expect(puissanceObtenue(tel('apple-iphone-15'), chargeur('apple-20w'))).toBe(20);
    expect(puissanceObtenue(tel('apple-iphone-15'), chargeur('generique-65w-pps'))).toBe(20);
    expect(puissanceObtenue(tel('apple-iphone-11'), chargeur('apple-20w'))).toBe(18);
  });

  it('PPS : sans PPS, un Samsung retombe à 15 W', () => {
    const s24Ultra = tel('samsung-galaxy-s24-ultra');
    expect(puissanceObtenue(s24Ultra, chargeur('samsung-45w'))).toBe(45);
    expect(puissanceObtenue(s24Ultra, chargeur('samsung-25w'))).toBe(25);
    expect(puissanceObtenue(s24Ultra, chargeur('apple-20w'))).toBe(15);
    // Un 65 W dont le PPS plafonne à 45 W donne 45 W, pas 65.
    expect(puissanceObtenue(s24Ultra, chargeur('generique-65w-pps'))).toBe(45);
  });

  it('PPS : vitesse non communiquée sans PPS → null', () => {
    expect(puissanceObtenue(tel('google-pixel-8'), chargeur('generique-20w-pd'))).toBeNull();
  });

  it('charge propriétaire : seul le chargeur d’origine donne la vitesse maximale', () => {
    const xiaomi = tel('xiaomi-xiaomi-13t-pro');
    const origine = chargeurOrigine(xiaomi)!;
    expect(origine.nom).toBe('Chargeur d’origine 120 W HyperCharge');
    expect(puissanceObtenue(xiaomi, origine)).toBe(120);
    expect(puissanceObtenue(xiaomi, chargeur('generique-65w-pps'))).toBeNull();
    expect(chargeurOrigine(tel('apple-iphone-15'))).toBeNull();
  });
});

describe('propositions', () => {
  it('Galaxy S24 : le 25 W Samsung en tête, jamais le chargeur d’une autre marque de téléphone', () => {
    const p = proposer(tel('samsung-galaxy-s24'), CHARGEURS);
    expect(p[0].chargeur.id).toBe('samsung-25w');
    expect(p[0].maximale).toBe(true);
    const marques = new Set(p.map((x) => x.chargeur.marque));
    expect(marques.has('Apple')).toBe(false);
    expect(marques.has('Google')).toBe(false);
    // Les chargeurs des fabricants d'accessoires restent proposés.
    expect(p.find((x) => x.chargeur.id === 'generique-30w-pps')?.puissanceObtenueW).toBe(25);
  });

  it('tris : prix croissant, puissance décroissante, fiabilité décroissante', () => {
    const s24 = tel('samsung-galaxy-s24');
    expect(proposer(s24, CHARGEURS, 'prix')[0].chargeur.budget).toBe(1);
    expect(proposer(s24, CHARGEURS, 'puissance')[0].chargeur.puissanceW).toBe(65);
    const fiables = proposer(s24, CHARGEURS, 'fiabilite');
    expect(fiables[0].chargeur.fiabilite).toBe(3);
    expect(fiables[0].chargeur.id).toBe('samsung-25w');
  });

  it('charge propriétaire : chargeur d’origine d’abord', () => {
    const p = proposer(tel('oneplus-oneplus-12'), CHARGEURS);
    expect(p[0].chargeur.origineDe).toBe('OnePlus');
    expect(p[0].puissanceObtenueW).toBe(100);
  });
});

describe('recherche', () => {
  it('ignore accents, majuscules et « + »', () => {
    expect(normaliser('Galaxy S24+')).toBe('galaxy s24 plus');
    expect(chercher(TELEPHONES, 'galaxy s24 plus')[0].id).toBe('samsung-galaxy-s24-plus');
    expect(chercher(TELEPHONES, 'IPHONE 15 pro')[0].id).toBe('apple-iphone-15-pro');
  });

  it('cherche par marque, par début de mot, et met le modèle exact en tête', () => {
    expect(chercher(TELEPHONES, 'pixel 8')[0].id).toBe('google-pixel-8');
    expect(chercher(TELEPHONES, 'sams s23').every((t) => t.marque === 'Samsung')).toBe(true);
    expect(chercher(TELEPHONES, 'xiaomi').length).toBeGreaterThan(0);
    expect(chercher(TELEPHONES, '')).toEqual([]);
    expect(chercher(TELEPHONES, 'nokia 3310')).toEqual([]);
  });
});

describe('détection', () => {
  it('reconnaît un modèle par sa référence, la plus précise d’abord', () => {
    expect(trouverParModele(TELEPHONES, 'SM-S921B')?.id).toBe('samsung-galaxy-s24');
    expect(trouverParModele(TELEPHONES, 'Pixel 8 Pro')?.id).toBe('google-pixel-8-pro');
    expect(trouverParModele(TELEPHONES, 'Pixel 8')?.id).toBe('google-pixel-8');
    expect(trouverParModele(TELEPHONES, 'Pixel 8a')?.id).toBe('google-pixel-8a');
    expect(trouverParModele(TELEPHONES, 'Inconnu')).toBeUndefined();
  });

  it('lit le modèle dans le « user agent » Android, sauf s’il est masqué', () => {
    expect(modeleDepuisUA('Mozilla/5.0 (Linux; Android 14; SM-S928B Build/UP1A) AppleWebKit/537.36')).toBe('SM-S928B');
    expect(modeleDepuisUA('Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36')).toBeUndefined();
  });

  it('iPhone : seulement la marque ; Android : le modèle, ou la marque à défaut', () => {
    expect(analyser(TELEPHONES, 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)')).toEqual({ marque: 'Apple' });
    expect(analyser(TELEPHONES, 'Mozilla/5.0 (Linux; Android 10; K)', 'SM-A556B').telephone?.id).toBe('samsung-galaxy-a55');
    expect(analyser(TELEPHONES, 'Mozilla/5.0 (Linux; Android 10; K)', 'SM-X999')).toEqual({ marque: 'Samsung' });
    expect(analyser(TELEPHONES, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toEqual({});
  });
});

describe('lien marchand', () => {
  it('ajoute l’identifiant d’affiliation quand il est réglé', () => {
    expect(lienMarchand('chargeur USB-C 45W', 'monsite-21')).toBe('https://www.amazon.fr/s?k=chargeur+USB-C+45W&tag=monsite-21');
    expect(lienMarchand('chargeur USB-C 45W', '')).toBe('https://www.amazon.fr/s?k=chargeur+USB-C+45W');
  });
});
