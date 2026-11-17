import { ORDINATEURS, TELEPHONES } from '../data';
import { lireAdresse } from './adresses';
import { pageGuide, pageOrdinateur, pageTelephone, toutesLesPages } from './pages';

describe('pages générées pour les moteurs de recherche', () => {
  it('une page par téléphone vérifié et par ordinateur, adresses uniques, titres et descriptions remplis', () => {
    const pages = toutesLesPages();
    expect(pages.length).toBe(3 + TELEPHONES.length + ORDINATEURS.filter((o) => !o.generique).length);
    expect(new Set(pages.map((p) => p.chemin)).size).toBe(pages.length);
    expect(new Set(pages.map((p) => p.titre)).size).toBe(pages.length);
    for (const p of pages) {
      expect(p.description.length, p.chemin).toBeGreaterThan(60);
      expect(p.contenu, p.chemin).toMatch(/<h1>/);
    }
  });

  it('page d’un téléphone : réponse directe, chargeur conseillé par la marque, FAQ structurée', () => {
    const p = pageTelephone(TELEPHONES.find((t) => t.id === 'apple-iphone-17-pro-max')!);
    expect(p.chemin).toBe('/chargeur/apple-iphone-17-pro-max/');
    expect(p.titre).toMatch(/^Chargeur iPhone 17 Pro Max/);
    expect(p.contenu).toMatch(/Chargeur conseillé par Apple : Adaptateur secteur dynamique USB-C 40 W Apple \(40 W, vitesse maximale\)/);
    const faq = p.jsonLd.find((j) => (j as { '@type': string })['@type'] === 'FAQPage') as { mainEntity: { name: string }[] };
    expect(faq.mainEntity.map((q) => q.name)).toContain('Quel chargeur pour iPhone 17 Pro Max ?');
    expect(p.contenu).not.toMatch(/<script/);
  });

  it('page d’un ordinateur à prise ronde : chargeur de la marque, pas d’USB-C', () => {
    const p = pageOrdinateur(ORDINATEURS.find((o) => o.id === 'hp-victus')!);
    expect(p.contenu).toMatch(/pas en USB-C/);
    expect(p.contenu).toMatch(/Non : sa prise de recharge n’est pas en USB-C/);
  });

  it('accueil : répond à « quel chargeur choisir » et « de quel chargeur ai-je besoin », en FAQ structurée', () => {
    const p = toutesLesPages()[0];
    expect(p.titre).toMatch(/^Quel chargeur choisir/);
    const faq = p.jsonLd.find((j) => (j as { '@type': string })['@type'] === 'FAQPage') as { mainEntity: { name: string }[] };
    expect(faq.mainEntity.map((q) => q.name)).toEqual(expect.arrayContaining(['De quel chargeur ai-je besoin ?', 'Quel chargeur choisir pour mon téléphone ?']));
  });

  it('guide : questions et explications', () => {
    expect(pageGuide().contenu).toMatch(/C’est quoi, le PPS/);
  });

  it('lecture des adresses', () => {
    expect(lireAdresse('/chargeur/apple-iphone-15/')).toEqual({ tel: 'apple-iphone-15' });
    expect(lireAdresse('/ordinateur/')).toEqual({ pc: 'choix' });
    expect(lireAdresse('/ordinateur/hp-victus/')).toEqual({ pc: 'hp-victus' });
    expect(lireAdresse('/guide/')).toEqual({ guide: true });
    expect(lireAdresse('/', '?tel=google-pixel-8')).toEqual({ tel: 'google-pixel-8', pc: undefined });
  });
});
