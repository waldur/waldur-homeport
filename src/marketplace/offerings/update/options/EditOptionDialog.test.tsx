import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { EditOptionDialog } from './EditOptionDialog';

const offering: any = {
  uuid: 'off-1',
  options: {
    order: ['tier', 'size'],
    options: {
      tier: {
        type: 'select_string',
        label: 'Tier',
        choices: ['basic', 'premium'],
      },
      size: {
        type: 'integer',
        label: 'Size',
        visible_if: { field: 'tier', values: ['premium'] },
      },
    },
  },
};

describe('EditOptionDialog', () => {
  it('blocks removing a choice that another rule refers to', async () => {
    renderWithProviders(
      <EditOptionDialog
        resolve={{
          offering,
          type: 'options',
          refetch: vi.fn(),
          option: { ...offering.options.options.tier, name: 'tier' },
        }}
      />,
    );
    const save = screen.getByRole('button', { name: 'Save' });
    expect(save).toBeEnabled();

    const choices = screen.getByDisplayValue('basic, premium');
    await userEvent.clear(choices);
    await userEvent.type(choices, 'basic');

    expect(
      screen.getByText('Remove the "Show only when" rule from: Size first.'),
    ).toBeInTheDocument();
    expect(save).toBeDisabled();
  });
});
