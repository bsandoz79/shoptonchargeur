import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Produit } from './Produit';

describe('carte produit', () => {
  it('toute la carte ouvre le produit, comme le bouton', async () => {
    const clic = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    render(<ul><Produit p={{ id: 'x', marque: 'Anker', nom: 'Anker Nano 30 W', budget: 1, evaluation: 'tresbon', requete: 'anker nano 30w' }} /></ul>);
    await userEvent.click(screen.getByRole('heading', { name: 'Anker Nano 30 W' }));
    expect(clic).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Très bon')).toBeInTheDocument();
    clic.mockRestore();
  });
});
