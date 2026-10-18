import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { FieldEditButton } from './FieldEditButton';
import { StringField } from './StringField';

const baseProps = {
  scope: { name: 'Alice' },
  name: 'name',
  callback: vi.fn(),
  fieldComponent: StringField,
};

describe('FieldEditButton', () => {
  it('is named after the field it edits', () => {
    renderWithProviders(<FieldEditButton {...baseProps} title="Full name" />);
    expect(
      screen.getByRole('button', { name: 'Edit Full name' }),
    ).toBeInTheDocument();
  });

  it('keeps that name while disabled, and says why in the tooltip', () => {
    renderWithProviders(
      <FieldEditButton
        {...baseProps}
        title="Full name"
        disabled
        tooltip="Managed by the identity provider"
      />,
    );
    const button = screen.getByRole('button', { name: 'Edit Full name' });
    expect(button).toBeDisabled();
    expect(button).toHaveAccessibleDescription(
      'Managed by the identity provider',
    );
  });

  it('falls back to "Edit" when the label is not text', () => {
    renderWithProviders(
      <FieldEditButton {...baseProps} label={<span>Full name</span>} />,
    );
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });
});
