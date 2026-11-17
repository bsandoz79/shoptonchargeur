import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';

const uaDepart = navigator.userAgent;
const poserUA = (ua: string) => Object.defineProperty(navigator, 'userAgent', { value: ua, configurable: true });
/** Cartes produit affichées (les puces de caractéristiques sont aussi des éléments de liste : on garde ceux qui ont un titre). */
const produits = () => screen.getAllByRole('listitem').filter((li) => li.querySelector('h3'));
const carte = (nom: string) => produits().find((c) => within(c).queryByRole('heading', { name: nom }))!;

beforeEach(() => { window.history.replaceState(null, '', '/'); });
afterEach(() => { poserUA(uaDepart); });

describe('App', () => {
  it('cherche un téléphone, affiche sa fiche et ses chargeurs, le meilleur en tête, avec le câble qui va avec', async () => {
    render(<App />);
    await userEvent.type(screen.getByRole('combobox', { name: 'Quel téléphone veux-tu recharger ?' }), 'galaxy s24 ultra');
    await userEvent.click(screen.getByRole('option', { name: /Galaxy S24 Ultra/ }));

    expect(screen.getByRole('heading', { level: 2, name: 'Galaxy S24 Ultra' })).toBeInTheDocument();
    expect(screen.getByText(/Sans PPS, la charge retombe à 15 W/)).toBeInTheDocument();
    expect(window.location.search).toBe('?tel=samsung-galaxy-s24-ultra');

    const premier = produits()[0];
    expect(within(premier).getByText('Notre choix')).toBeInTheDocument();
    expect(within(premier).getByRole('heading', { name: 'Chargeur ultra rapide 45 W' })).toBeInTheDocument();
    expect(within(premier).getByText('45 W, vitesse maximale')).toBeInTheDocument();
    // Rapport qualité/prix, explication, câble à associer.
    expect(within(premier).getByText('Qualité/prix')).toBeInTheDocument();
    expect(within(premier).getByText(/Ce chargeur a le « PPS »/)).toBeInTheDocument();
    expect(within(premier).getByRole('link', { name: /Câble USB-C 5 A \(100 W\)/ })).toHaveAttribute('href', expect.stringContaining('5A'));
    const lien = within(premier).getByRole('link', { name: /Voir le prix/ });
    expect(lien).toHaveAttribute('href', expect.stringContaining('https://www.amazon.fr/s?k=Samsung+chargeur+45W'));
    expect(lien).toHaveAttribute('rel', 'sponsored nofollow noopener');

    const anker45 = carte('Anker Nano 45 W');
    expect(within(anker45).getByText('25 W sur 45 W possibles')).toBeInTheDocument();
    expect(within(anker45).getByText(/pas avec assez de courant \(5 A\)/)).toBeInTheDocument();
    expect(within(anker45).getByText('Moyen')).toBeInTheDocument();
  });

  it('onglet sans fil : chargeurs Qi de la marque pour un Galaxy, rien de magnétique', async () => {
    window.history.replaceState(null, '', '/?tel=samsung-galaxy-s24-ultra');
    render(<App />);
    await userEvent.click(screen.getByRole('tab', { name: /Sans fil/ }));
    const noms = produits().map((c) => within(c).getByRole('heading').textContent);
    expect(noms).toContain('Chargeur sans fil Samsung 15 W');
    expect(noms.some((n) => /MagSafe|Qi2|Pixel/.test(n ?? ''))).toBe(false);
  });

  it('onglet sans fil : MagSafe pour un iPhone 16 (25 W), rien pour un téléphone sans recharge sans fil', async () => {
    window.history.replaceState(null, '', '/?tel=apple-iphone-16-pro');
    const { unmount } = render(<App />);
    await userEvent.click(screen.getByRole('tab', { name: /Sans fil/ }));
    const magsafe = carte('Chargeur MagSafe (25 W)');
    expect(within(magsafe).getByText('25 W, vitesse maximale sans fil')).toBeInTheDocument();
    expect(within(produits()[0]).getByText('Notre choix')).toBeInTheDocument();
    unmount();

    window.history.replaceState(null, '', '/?tel=samsung-galaxy-a55-5g');
    render(<App />);
    await userEvent.click(screen.getByRole('tab', { name: /Sans fil/ }));
    expect(screen.getByText(/n’a pas la recharge sans fil/)).toBeInTheDocument();
  });

  it('trie par prix, puis revient à la recherche avec « Changer »', async () => {
    window.history.replaceState(null, '', '/?tel=google-pixel-8');
    render(<App />);
    expect(screen.getByRole('heading', { level: 2, name: 'Pixel 8' })).toBeInTheDocument();
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Trier' }), 'Prix');
    expect(within(produits()[0]).getByLabelText(/Petit prix/)).toBeInTheDocument();
    expect(screen.queryByText('Notre choix')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Changer' }));
    expect(screen.getByRole('combobox', { name: 'Quel téléphone veux-tu recharger ?' })).toBeInTheDocument();
    expect(window.location.search).toBe('');
  });

  it('au clavier : flèche et Entrée choisissent une suggestion ; iPhone Lightning : câble Lightning conseillé', async () => {
    render(<App />);
    await userEvent.type(screen.getByRole('combobox'), 'iphone 14{ArrowDown}{Enter}');
    expect(screen.getByRole('heading', { level: 2, name: /iPhone 14/ })).toBeInTheDocument();
    expect(within(produits()[0]).getByRole('link', { name: /Câble USB-C vers Lightning certifié MFi/ })).toBeInTheDocument();
  });

  it('détecte un Android reconnu et propose ses chargeurs', async () => {
    poserUA('Mozilla/5.0 (Linux; Android 14; SM-S921B Build/UP1A.231005.007) AppleWebKit/537.36');
    render(<App />);
    const detecte = await screen.findByRole('status');
    expect(detecte).toHaveTextContent('Appareil détecté');
    expect(detecte).toHaveTextContent('Samsung Galaxy S24');
    await userEvent.click(within(detecte).getByRole('button', { name: 'Voir ses chargeurs' }));
    expect(screen.getByRole('heading', { level: 2, name: 'Galaxy S24' })).toBeInTheDocument();
  });

  it('sur iPhone : propose les modèles de la marque', async () => {
    poserUA('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15');
    render(<App />);
    expect(await screen.findByText('Tu es sur un iPhone : lequel ?')).toBeInTheDocument();
    await userEvent.click(await screen.findByRole('button', { name: 'iPhone 16 Pro' }));
    expect(screen.getByRole('heading', { level: 2, name: 'iPhone 16 Pro' })).toBeInTheDocument();
  });

  it('marque à charge rapide propre : chargeur d’origine conseillé', async () => {
    window.history.replaceState(null, '', '/?tel=oneplus-oneplus-12');
    render(<App />);
    expect(within(produits()[0]).getByRole('heading', { name: 'Chargeur d’origine 100 W SUPERVOOC' })).toBeInTheDocument();
    expect(screen.getByText(/seul un chargeur OnePlus donne les 100 W/)).toBeInTheDocument();
  });

  it('téléphone sans fiche vérifiée : trouvé dans le catalogue, conseil de marque, aucune vitesse annoncée', async () => {
    render(<App />);
    await userEvent.type(screen.getByRole('combobox'), 's25 edge');
    await userEvent.click(await screen.findByRole('option', { name: /Galaxy S25 Edge/ }));
    expect(screen.getByRole('heading', { level: 2, name: 'Galaxy S25 Edge' })).toBeInTheDocument();
    expect(screen.getByText(/Fiche de charge pas encore vérifiée/)).toBeInTheDocument();
    for (const c of produits()) {
      expect(within(c).queryByText(/vitesse maximale|Charge plus lente|Pourquoi il convient/)).not.toBeInTheDocument();
    }
    expect(within(produits()[0]).getByText('Samsung')).toBeInTheDocument();
  });

  it('adresse partagée vers un téléphone du catalogue : affiché une fois le catalogue chargé', async () => {
    window.history.replaceState(null, '', '/?tel=samsung-galaxy-s25-edge');
    render(<App />);
    expect(await screen.findByRole('heading', { level: 2, name: 'Galaxy S25 Edge' })).toBeInTheDocument();
  });

  it('ordinateur portable : choix par la puissance du chargeur d’origine, verdict expliqué', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'Ordinateur portable' }));
    expect(screen.getByText(/se rechargent par un port/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '65 W' }));
    expect(screen.getByRole('heading', { level: 2, name: 'PC portable avec chargeur de 65 W' })).toBeInTheDocument();
    expect(window.location.search).toBe('?pc=pc-65w');

    const liste = produits();
    expect(within(liste[0]).getByText('Notre choix')).toBeInTheDocument();
    expect(within(liste[0]).getByText('Recharge normale')).toBeInTheDocument();
    expect(within(liste[0]).getByText(/au moins les 65 W du chargeur d’origine/)).toBeInTheDocument();
    expect(within(liste[0]).getByRole('link', { name: /Câble USB-C 5 A \(100 W\)/ })).toBeInTheDocument();
    // Pas de chargeur Apple pour un PC ; les chargeurs trop faibles sont signalés, en dernier, sans câble conseillé.
    expect(screen.queryByText('Adaptateur secteur USB-C 96 W')).not.toBeInTheDocument();
    const dernier = liste[liste.length - 1];
    expect(within(dernier).getByText('Trop faible : recharge lente')).toBeInTheDocument();
    expect(within(dernier).queryByText('À associer')).not.toBeInTheDocument();
  });

  it('MacBook : recharge rapide à partir de la puissance annoncée', async () => {
    window.history.replaceState(null, '', '/?pc=macbook-pro-14');
    render(<App />);
    expect(screen.getByRole('heading', { level: 2, name: 'MacBook Pro 14 pouces' })).toBeInTheDocument();
    expect(within(carte('Adaptateur secteur USB-C 96 W')).getByText('Recharge rapide')).toBeInTheDocument();
  });

  it('guide : le bloc, le câble, les premiers prix, puis les questions', async () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 2, name: 'Comment ça marche, un chargeur ?' })).toBeInTheDocument();
    for (const titre of ['Comment fonctionne un bloc', 'Comment fonctionne un câble', 'Pourquoi éviter les chargeurs premier prix']) {
      expect(screen.getByRole('heading', { level: 3, name: titre })).toBeInTheDocument();
    }
    expect(screen.getByText(/Le logo « CE » ne prouve rien/)).toBeInTheDocument();
    await userEvent.click(screen.getByText(/C’est quoi, le PPS/));
    expect(screen.getByText(/Le PPS est une option du Power Delivery/)).toBeVisible();
  });

  it('affiche la mention des liens affiliés', () => {
    render(<App />);
    expect(screen.getByText(/En tant que Partenaire Amazon/)).toBeInTheDocument();
  });
});
