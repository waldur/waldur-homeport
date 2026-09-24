import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { EditOptionDialog } from './EditOptionDialog';

const offering: any = {
  uuid: 'off-1',
  options: {
    order: ['tier', 'size', 'backups'],
    options: {
      backups: { type: 'boolean', label: 'Backups' },
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

const renderDialog = (optionKey: string) =>
  renderWithProviders(
    <EditOptionDialog
      resolve={{
        offering,
        type: 'options',
        refetch: vi.fn(),
        option: { ...offering.options.options[optionKey], name: optionKey },
      }}
    />,
  );

describe('EditOptionDialog', () => {
  it('shows the steps when the type has settings of its own', () => {
    renderDialog('tier');
    expect(
      screen.getByRole('group', { name: 'Form progress' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('hides the steps for a type without settings', () => {
    renderDialog('backups');
    expect(
      screen.queryByRole('group', { name: 'Form progress' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

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
    // The type-specific settings live on the second step.
    await userEvent.click(screen.getByTestId('wizard-submit-btn'));
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
