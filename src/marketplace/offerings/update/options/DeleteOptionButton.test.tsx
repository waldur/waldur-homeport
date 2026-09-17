import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { DeleteOptionButton } from './DeleteOptionButton';

// Expose the tooltip as an attribute; the real one only renders on hover.
vi.mock('@/table/CompactActionButton', () => ({
  CompactActionButton: ({ title, disabled, tooltip }) => (
    <button disabled={disabled} data-tooltip={tooltip}>
      {title}
    </button>
  ),
}));

const offering: any = {
  uuid: 'off-1',
  options: {
    order: ['backups', 'account', 'reason', 'size'],
    options: {
      backups: { type: 'boolean', label: 'Backups' },
      account: {
        type: 'string',
        label: 'Account',
        visible_if: { field: 'backups', values: [true] },
      },
      reason: {
        type: 'string',
        label: 'Reason',
        visible_if: { field: 'backups', values: [false] },
      },
      size: { type: 'integer', label: 'Size' },
    },
  },
};

const renderButton = (optionKey: string) =>
  renderWithProviders(
    <DeleteOptionButton
      offering={offering}
      type="options"
      optionKey={optionKey}
      optionLabel={offering.options.options[optionKey].label}
      refetch={vi.fn()}
      loading={false}
    />,
  );

describe('DeleteOptionButton', () => {
  it('blocks deleting an option that other rules refer to', () => {
    renderButton('backups');
    const button = screen.getByRole('button', { name: 'Delete' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute(
      'data-tooltip',
      'Remove the "Show only when" rule from: Account, Reason first.',
    );
  });

  it('allows deleting an option nothing depends on', () => {
    renderButton('size');
    expect(screen.getByRole('button', { name: 'Delete' })).toBeEnabled();
  });
});
