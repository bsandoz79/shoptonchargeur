import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';

const uaDepart = navigator.userAgent;
const poserUA = (ua: string) => Object.defineProperty(navigator, 'userAgent', { value: ua, configurable: true });

beforeEach(() => { window.history.replaceState(null, '', '/'); });
afterEach(() => { poserUA(uaDepart); });

describe('App', () => {
  it('cherche un téléphone, affiche sa fiche et ses chargeurs, le meilleur en tête', async () => {
    render(<App />);
    await userEvent.type(screen.getByRole('combobox', { name: 'Quel téléphone veux-tu recharger ?' }), 'galaxy s24 ultra');
    await userEvent.click(screen.getByRole('option', { name: /Galaxy S24 Ultra/ }));

    expect(screen.getByRole('heading', { level: 2, name: 'Galaxy S24 Ultra' })).toBeInTheDocument();
    expect(screen.getByText('45 W')).toBeInTheDocument();
    expect(screen.getByText(/Sans PPS, la charge retombe à 15 W/)).toBeInTheDocument();
    expect(window.location.search).toBe('?tel=samsung-galaxy-s24-ultra');

    const cartes = screen.getAllByRole('listitem');
    expect(within(cartes[0]).getByText('Notre conseil')).toBeInTheDocument();
    expect(within(cartes[0]).getByRole('heading', { name: 'Chargeur ultra rapide 45 W' })).toBeInTheDocument();
    expect(within(cartes[0]).getByText('45 W : vitesse maximale')).toBeInTheDocument();
    const lien = within(cartes[0]).getByRole('link', { name: /Voir sur Amazon/ });
    expect(lien).toHaveAttribute('href', expect.stringContaining('https://www.amazon.fr/s?k=Samsung+chargeur+45W'));
    expect(lien).toHaveAttribute('rel', 'sponsored nofollow noopener');
    // Câble 5 A pour les 45 W.
    expect(screen.getByText(/câble USB-C vers USB-C « 5 A »/)).toBeInTheDocument();
  });

  it('trie par prix, puis revient à la recherche avec « Changer »', async () => {
    window.history.replaceState(null, '', '/?tel=google-pixel-8');
    render(<App />);
    expect(screen.getByRole('heading', { level: 2, name: 'Pixel 8' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('radio', { name: 'Prix' }));
    expect(screen.getByRole('radio', { name: 'Prix' })).toBeChecked();
    expect(within(screen.getAllByRole('listitem')[0]).getByLabelText('Niveau de prix : 1 sur 3')).toBeInTheDocument();
    expect(screen.queryByText('Notre conseil')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Changer' }));
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(window.location.search).toBe('');
  });

  it('au clavier : flèche et Entrée choisissent une suggestion', async () => {
    render(<App />);
    await userEvent.type(screen.getByRole('combobox'), 'iphone 14{ArrowDown}{Enter}');
    expect(screen.getByRole('heading', { level: 2, name: /iPhone 14/ })).toBeInTheDocument();
    expect(screen.getByText(/câble USB-C vers Lightning/)).toBeInTheDocument();
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
    const premiere = screen.getAllByRole('listitem')[0];
    expect(within(premiere).getByRole('heading', { name: 'Chargeur d’origine 100 W SUPERVOOC' })).toBeInTheDocument();
    expect(screen.getByText(/seul un chargeur OnePlus donne les 100 W/)).toBeInTheDocument();
  });

  it('téléphone sans fiche vérifiée : trouvé dans le catalogue, conseil de marque, aucune vitesse annoncée', async () => {
    render(<App />);
    await userEvent.type(screen.getByRole('combobox'), 's25 edge');
    await userEvent.click(await screen.findByRole('option', { name: /Galaxy S25 Edge/ }));
    expect(screen.getByRole('heading', { level: 2, name: 'Galaxy S25 Edge' })).toBeInTheDocument();
    expect(screen.getByText(/Fiche de charge pas encore vérifiée/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Chargeurs polyvalents' })).toBeInTheDocument();
    expect(screen.queryByText(/vitesse maximale/)).not.toBeInTheDocument();
    expect(screen.queryByText('Charge plus lente')).not.toBeInTheDocument();
    expect(within(screen.getAllByRole('listitem')[0]).getByText('Samsung')).toBeInTheDocument();
  });

  it('adresse partagée vers un téléphone du catalogue : affiché une fois le catalogue chargé', async () => {
    window.history.replaceState(null, '', '/?tel=samsung-galaxy-s25-edge');
    render(<App />);
    expect(await screen.findByRole('heading', { level: 2, name: 'Galaxy S25 Edge' })).toBeInTheDocument();
  });

  it('affiche la mention des liens affiliés', () => {
    render(<App />);
    expect(screen.getByText(/En tant que Partenaire Amazon/)).toBeInTheDocument();
  });
});
