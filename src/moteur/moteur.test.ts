import { CHARGEURS, TELEPHONES, chargerCatalogue } from '../data';
import { lienMarchand } from './affiliation';
import { chargeurOrigine, proposer, proposerSansFiche, puissanceObtenue } from './compatibilite';
import { analyser, modeleDepuisUA, trouverParModele } from './detection';
import { conseilMarque } from './marques';
import { chercher, normaliser } from './recherche';
import { estVerifie, type Appareil } from './types';

const tel = (id: string) => TELEPHONES.find((t) => t.id === id)!;
const chargeur = (id: string) => CHARGEURS.find((c) => c.id === id)!;
let TOUS: Appareil[] = [];
beforeAll(async () => { TOUS = await chargerCatalogue(); });

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

  it('chaque téléphone vérifié a au moins un chargeur qui le charge à sa vitesse maximale', () => {
    for (const t of TELEPHONES) expect(proposer(t, CHARGEURS)[0].maximale, t.id).toBe(true);
  });

  it('catalogue : plus de mille téléphones, identifiants uniques, fiches vérifiées gardées et enrichies', () => {
    expect(TOUS.length).toBeGreaterThan(1000);
    expect(new Set(TOUS.map((a) => a.id)).size).toBe(TOUS.length);
    expect(TOUS.filter(estVerifie)).toHaveLength(TELEPHONES.length);
    // Le Galaxy S24 vérifié n'est pas doublé par celui du catalogue, et récupère ses références exactes.
    expect(TOUS.filter((a) => a.marque === 'Samsung' && a.modele === 'Galaxy S24')).toHaveLength(1);
    expect(tel('samsung-galaxy-s24').codes).toContain('SM-S921B');
    // Pas de tablette ni de montre.
    expect(TOUS.some((a) => /\b(tab|watch|pad)\b/i.test(a.modele))).toBe(false);
  });
});

describe('puissance obtenue', () => {
  it('Power Delivery : le plus petit des deux, téléphone ou chargeur', () => {
    expect(puissanceObtenue(tel('apple-iphone-15'), chargeur('apple-20w'))).toBe(20);
    expect(puissanceObtenue(tel('apple-iphone-15'), chargeur('anker-nano-45w'))).toBe(20);
    expect(puissanceObtenue(tel('apple-iphone-11'), chargeur('apple-20w'))).toBe(18);
  });

  it('PPS : sans PPS, un Samsung retombe à 15 W', () => {
    const s24Ultra = tel('samsung-galaxy-s24-ultra');
    expect(puissanceObtenue(s24Ultra, chargeur('samsung-45w'))).toBe(45);
    expect(puissanceObtenue(s24Ultra, chargeur('samsung-25w'))).toBe(25);
    expect(puissanceObtenue(s24Ultra, chargeur('anker-nano-20w'))).toBe(15);
  });

  it('Samsung 45 W : sans PPS à 5 A, un chargeur 45 W ne donne que 25 W', () => {
    const s24Ultra = tel('samsung-galaxy-s24-ultra');
    expect(puissanceObtenue(s24Ultra, chargeur('anker-nano-45w'))).toBe(25);
    expect(puissanceObtenue(s24Ultra, chargeur('ugreen-nexode-45w'))).toBe(45);
    // Un Pixel 9 Pro XL (37 W) n'a pas cette contrainte.
    expect(puissanceObtenue(tel('google-pixel-9-pro-xl'), chargeur('anker-nano-45w'))).toBe(37);
  });

  it('PPS : vitesse non communiquée sans PPS → null', () => {
    expect(puissanceObtenue(tel('google-pixel-8'), chargeur('anker-nano-20w'))).toBeNull();
  });

  it('charge propriétaire : seul le chargeur d’origine donne la vitesse maximale', () => {
    const xiaomi = tel('xiaomi-xiaomi-13t-pro');
    const origine = chargeurOrigine(xiaomi)!;
    expect(origine.nom).toBe('Chargeur d’origine 120 W HyperCharge');
    expect(puissanceObtenue(xiaomi, origine)).toBe(120);
    expect(puissanceObtenue(xiaomi, chargeur('anker-nano-45w'))).toBeNull();
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
    // Les grandes marques d'accessoires restent proposées.
    expect(p.find((x) => x.chargeur.id === 'anker-nano-30w')?.puissanceObtenueW).toBe(25);
  });

  it('tris : prix croissant, puissance décroissante, fiabilité décroissante', () => {
    const s24 = tel('samsung-galaxy-s24');
    expect(proposer(s24, CHARGEURS, 'prix')[0].chargeur.budget).toBe(1);
    expect(proposer(s24, CHARGEURS, 'puissance')[0].chargeur.puissanceW).toBe(45);
    const fiables = proposer(s24, CHARGEURS, 'fiabilite');
    expect(fiables[0].chargeur.fiabilite).toBe(3);
    expect(fiables[0].chargeur.id).toBe('samsung-25w');
  });

  it('charge propriétaire : chargeur d’origine d’abord', () => {
    const p = proposer(tel('oneplus-oneplus-12'), CHARGEURS);
    expect(p[0].chargeur.origineDe).toBe('OnePlus');
    expect(p[0].puissanceObtenueW).toBe(100);
  });

  it('sans fiche vérifiée : aucune vitesse annoncée, chargeur de la marque puis chargeurs PPS', () => {
    const galaxy = TOUS.find((a) => a.marque === 'Samsung' && !estVerifie(a))!;
    const p = proposerSansFiche(galaxy, CHARGEURS);
    expect(p.every((x) => x.puissanceObtenueW === null && !x.maximale)).toBe(true);
    expect(p[0].chargeur.marque).toBe('Samsung');
    expect(p.some((x) => x.chargeur.marque === 'Apple' || x.chargeur.marque === 'Google')).toBe(false);

    const oppo = TOUS.find((a) => a.marque === 'OPPO')!;
    expect(proposerSansFiche(oppo, CHARGEURS)[0].chargeur.origineDe).toBe('OPPO');
    expect(conseilMarque('OPPO')).toMatch(/sa propre charge rapide/);
    expect(conseilMarque('Sony')).toMatch(/Power Delivery/);
  });
});

describe('recherche', () => {
  it('ignore accents, majuscules et « + »', () => {
    expect(normaliser('Galaxy S24+')).toBe('galaxy s24 plus');
    expect(chercher(TELEPHONES, 'galaxy s24 plus')[0].id).toBe('samsung-galaxy-s24-plus');
    expect(chercher(TELEPHONES, 'IPHONE 15 pro')[0].id).toBe('apple-iphone-15-pro');
  });

  it('« s » propose les Galaxy S, les plus récents d’abord, avant les autres Samsung', () => {
    const noms = chercher(TOUS, 's').map((a) => a.modele);
    expect(noms[0]).toMatch(/^Galaxy S\d\d/);
    const rang = (modele: string) => noms.indexOf(modele);
    const ordre = ['Galaxy S25 Ultra', 'Galaxy S25+', 'Galaxy S25 FE', 'Galaxy S25 Edge', 'Galaxy S25', 'Galaxy S24 Ultra', 'Galaxy S24', 'Galaxy S23 Ultra'];
    expect(ordre.map(rang)).toEqual([...ordre.map(rang)].sort((a, b) => a - b));
    expect(ordre.map(rang).every((i) => i >= 0)).toBe(true);
    for (const modele of ['Galaxy S24', 'Galaxy S24 Ultra', 'Galaxy S23', 'Galaxy S22']) expect(noms).toContain(modele);
    expect(noms.some((n) => /^Galaxy A/.test(n))).toBe(false);
  });

  it('le nom seul suffit, sans la marque', () => {
    expect(chercher(TOUS, 's24 ultra')[0].id).toBe('samsung-galaxy-s24-ultra');
    expect(chercher(TOUS, 'pixel 8')[0].id).toBe('google-pixel-8');
    expect(chercher(TOUS, 'note 13 pro')[0].modele).toMatch(/Note 13 Pro/);
    expect(chercher(TOUS, 'sams s23').every((t) => t.marque === 'Samsung')).toBe(true);
    expect(chercher(TOUS, '')).toEqual([]);
    expect(chercher(TOUS, 'zzzz introuvable')).toEqual([]);
  });

  it('trouve aussi les téléphones sans fiche vérifiée', () => {
    const edge = chercher(TOUS, 's25 edge')[0];
    expect(edge.modele).toBe('Galaxy S25 Edge');
    expect(estVerifie(edge)).toBe(false);
    expect(chercher(TOUS, 'nothing phone').length).toBeGreaterThan(2);
  });
});

describe('détection', () => {
  it('reconnaît un modèle par sa référence, la plus précise d’abord', () => {
    expect(trouverParModele(TELEPHONES, 'SM-S921B')?.id).toBe('samsung-galaxy-s24');
    expect(trouverParModele(TELEPHONES, 'SM-S921XYZ')?.id).toBe('samsung-galaxy-s24');
    expect(trouverParModele(TOUS, 'Pixel 8 Pro')?.id).toBe('google-pixel-8-pro');
    expect(trouverParModele(TOUS, 'Pixel 8')?.id).toBe('google-pixel-8');
    expect(trouverParModele(TOUS, 'Pixel 8a')?.id).toBe('google-pixel-8a');
    expect(trouverParModele(TOUS, 'A065')?.modele).toBe('Nothing Phone (2)');
    expect(trouverParModele(TOUS, 'Inconnu')).toBeUndefined();
  });

  it('lit le modèle dans le « user agent » Android, sauf s’il est masqué', () => {
    expect(modeleDepuisUA('Mozilla/5.0 (Linux; Android 14; SM-S928B Build/UP1A) AppleWebKit/537.36')).toBe('SM-S928B');
    expect(modeleDepuisUA('Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36')).toBeUndefined();
  });

  it('iPhone : seulement la marque ; Android : le modèle, ou la marque à défaut', () => {
    expect(analyser(TOUS, 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)')).toEqual({ marque: 'Apple' });
    expect(analyser(TOUS, 'Mozilla/5.0 (Linux; Android 10; K)', 'SM-A556B').telephone?.id).toBe('samsung-galaxy-a55-5g');
    expect(analyser(TOUS, 'Mozilla/5.0 (Linux; Android 10; K)', 'SM-X999Z')).toEqual({ marque: 'Samsung' });
    expect(analyser(TOUS, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toEqual({});
  });
});

describe('lien marchand', () => {
  it('ajoute l’identifiant d’affiliation quand il est réglé', () => {
    expect(lienMarchand('chargeur USB-C 45W', 'monsite-21')).toBe('https://www.amazon.fr/s?k=chargeur+USB-C+45W&tag=monsite-21');
    expect(lienMarchand('chargeur USB-C 45W', '')).toBe('https://www.amazon.fr/s?k=chargeur+USB-C+45W');
  });
});

describe('sans fil', () => {
  it('iPhone MagSafe : chargeurs magnétiques, plafonnés à ce que le téléphone accepte', async () => {
    const { CHARGEURS_SANS_FIL } = await import('../data');
    const { proposerSansFil } = await import('./sansFil');
    const i15 = proposerSansFil(tel('apple-iphone-15'), CHARGEURS_SANS_FIL);
    expect(i15.every((p) => p.chargeur.norme !== 'qi')).toBe(true);
    expect(i15.find((p) => p.chargeur.id === 'apple-magsafe-25w')?.puissanceObtenueW).toBe(15);
    expect(proposerSansFil(tel('apple-iphone-16'), CHARGEURS_SANS_FIL)[0].puissanceObtenueW).toBe(25);
    // iPhone 16e : pas d'aimants, Qi seulement à 7,5 W.
    const i16e = proposerSansFil(tel('apple-iphone-16e'), CHARGEURS_SANS_FIL);
    expect(i16e.every((p) => p.chargeur.norme === 'qi' && p.puissanceObtenueW === 7.5)).toBe(true);
    expect(i16e.some((p) => p.chargeur.marque === 'Samsung' || p.chargeur.reservePixel)).toBe(false);
  });

  it('Android : chargeurs Qi, ceux de la marque compris, Pixel Stand réservé aux Pixel ; sans recharge sans fil : rien', async () => {
    const { CHARGEURS_SANS_FIL } = await import('../data');
    const { proposerSansFil } = await import('./sansFil');
    const pixel = proposerSansFil(tel('google-pixel-9'), CHARGEURS_SANS_FIL).map((p) => p.chargeur.id);
    expect(pixel).toContain('google-pixel-stand-2');
    expect(pixel).not.toContain('samsung-pad-15w');
    expect(proposerSansFil(tel('samsung-galaxy-s24'), CHARGEURS_SANS_FIL).map((p) => p.chargeur.id)).not.toContain('google-pixel-stand-2');
    expect(proposerSansFil(tel('samsung-galaxy-a55-5g'), CHARGEURS_SANS_FIL)).toEqual([]);
  });
});

describe('rapport qualité/prix', () => {
  it('croise vitesse obtenue, fiabilité et niveau de prix', async () => {
    const { qualitePrix } = await import('./qualitePrix');
    expect(qualitePrix(1, 2, 1)).toBe('Excellent');
    expect(qualitePrix(1, 3, 3)).toBe('Très bon');
    expect(qualitePrix(1, 2, 3)).toBe('Bon');
    expect(qualitePrix(25 / 45, 2, 2)).toBe('Moyen');
    expect(qualitePrix(null, 3, 2)).toBe('Très bon');
  });
});

describe('priorités d’achat', () => {
  it('chargeur conseillé par le constructeur : le moins puissant de la marque qui donne la vitesse maximale', async () => {
    const { selectionner } = await import('./selection');
    const vers = (p: ReturnType<typeof proposer>[number], t: ReturnType<typeof tel>) => ({
      id: p.chargeur.id, marque: p.chargeur.marque, fiabilite: p.chargeur.fiabilite, budget: p.chargeur.budget, puissanceW: p.chargeur.puissanceW,
      part: p.puissanceObtenueW === null ? 0 : p.puissanceObtenueW / t.puissanceMaxW, origine: p.chargeur.origineDe === t.marque,
    });
    const choisir = (id: string) => { const t = tel(id); return selectionner(t.marque, proposer(t, CHARGEURS), (p) => vers(p, t)); };
    expect(choisir('apple-iphone-15').constructeur?.chargeur.id).toBe('apple-20w');
    expect(choisir('apple-iphone-17-pro-max').constructeur?.chargeur.id).toBe('apple-40w');
    expect(choisir('samsung-galaxy-s24').constructeur?.chargeur.id).toBe('samsung-25w');
    expect(choisir('samsung-galaxy-s24-ultra').constructeur?.chargeur.id).toBe('samsung-45w');
    expect(choisir('google-pixel-9-pro-xl').constructeur?.chargeur.id).toBe('google-45w');
    expect(choisir('oneplus-oneplus-12').constructeur?.chargeur.origineDe).toBe('OnePlus');
    // Meilleur rapport qualité/prix : un autre produit, à pleine vitesse, le moins cher à barème égal.
    const s24 = choisir('samsung-galaxy-s24');
    expect(s24.qualitePrix?.chargeur.id).not.toBe('samsung-25w');
    expect(s24.qualitePrix?.chargeur.budget).toBe(1);
    expect(s24.qualitePrix?.maximale).toBe(true);
    expect(s24.autres).not.toContain(s24.constructeur);
    expect(s24.autres).not.toContain(s24.qualitePrix);
  });
});
