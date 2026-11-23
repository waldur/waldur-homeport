import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  customersList,
  marketplacePublicOfferingsList,
  personalAccessTokensAvailableBindingEntitiesList,
  projectsList,
  proposalPublicCallsList,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { EntityScopePicker } from './EntityScopePicker';

const renderPicker = (type: string | null) =>
  renderWithProviders(
    <div data-testid="picker">
      <EntityScopePicker
        type={type}
        value={null}
        onChange={vi.fn()}
        aria-label="Entity 1"
      />
    </div>,
  );

describe('EntityScopePicker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists only the entities a token can be restricted to, with their context', async () => {
    const user = userEvent.setup();
    vi.mocked(
      personalAccessTokensAvailableBindingEntitiesList,
    ).mockResolvedValue({
      data: [
        {
          type: 'project',
          uuid: 'p1',
          name: 'Proj One',
          context: 'Org A',
        },
      ],
    } as any);
    renderPicker('project');

    await user.click(
      within(screen.getByTestId('picker')).getByRole('combobox'),
    );
    expect(
      await screen.findByRole('option', { name: 'Proj One (Org A)' }),
    ).toBeInTheDocument();
    expect(
      personalAccessTokensAvailableBindingEntitiesList,
    ).toHaveBeenCalledWith({ query: { type: 'project' } });

    await user.type(
      within(screen.getByTestId('picker')).getByRole('combobox'),
      'Proj',
    );
    await waitFor(() =>
      expect(
        personalAccessTokensAvailableBindingEntitiesList,
      ).toHaveBeenCalledWith({ query: { type: 'project', query: 'Proj' } }),
    );

    // Not the general lists, which offer entities the token cannot take.
    for (const general of [
      customersList,
      projectsList,
      marketplacePublicOfferingsList,
      proposalPublicCallsList,
    ]) {
      expect(general).not.toHaveBeenCalled();
    }
  });

  it('says so when the user can restrict a token to nothing of the type', async () => {
    const user = userEvent.setup();
    vi.mocked(
      personalAccessTokensAvailableBindingEntitiesList,
    ).mockResolvedValue({ data: [] } as any);
    renderPicker('call');

    await user.click(
      within(screen.getByTestId('picker')).getByRole('combobox'),
    );
    expect(
      await screen.findByText('No entities you can restrict a token to'),
    ).toBeInTheDocument();
  });

  it('asks for a type before loading anything', () => {
    renderPicker(null);
    expect(
      personalAccessTokensAvailableBindingEntitiesList,
    ).not.toHaveBeenCalled();
  });
});
