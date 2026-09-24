import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { required } from '@/core/validators';
import { renderWithProviders } from '@/test/harness';

import { EditFieldDialog } from './EditFieldDialog';
import { FieldEditButtonProps } from './FieldEditButton.types';
import { NumberField } from './NumberField';
import { StringField } from './StringField';

vi.mock('@/modal/ModalDialog', () => ({
  ModalDialog: ({ children, footer }: any) => (
    <div>
      {children}
      {footer}
    </div>
  ),
}));

vi.mock('@/modal/CloseDialogButton', () => ({
  CloseDialogButton: () => <button type="button">Cancel</button>,
}));

vi.mock('@/form', () => ({
  SubmitButton: ({ label, disabled }: any) => (
    <button type="submit" disabled={disabled}>
      {label}
    </button>
  ),
}));

const renderDialog = (resolve: Partial<FieldEditButtonProps>) =>
  renderWithProviders(
    <EditFieldDialog
      resolve={
        {
          label: 'Organization name',
          fieldComponent: StringField,
          fieldProps: {},
          ...resolve,
        } as FieldEditButtonProps
      }
    />,
  );

const submit = () =>
  userEvent.click(screen.getByRole('button', { name: /confirm/i }));

describe('EditFieldDialog', () => {
  it('submits an empty string when a text field is cleared', async () => {
    const callback = vi.fn().mockResolvedValue({});
    renderDialog({
      scope: { organization: 'AI Platform Services' },
      name: 'organization',
      callback,
      emptyValue: '',
    });

    await userEvent.clear(screen.getByRole('textbox'));
    await submit();

    // Regression: React Final Form parses "" to undefined, which JSON.stringify
    // drops — the PATCH used to omit the key and silently keep the old value.
    await waitFor(() =>
      expect(callback).toHaveBeenCalledWith({ organization: '' }),
    );
  });

  it('submits null when a numeric field is cleared', async () => {
    const callback = vi.fn().mockResolvedValue({});
    renderDialog({
      scope: { limit: 42 },
      name: 'limit',
      callback,
      fieldComponent: NumberField as any,
      emptyValue: null,
    });

    await userEvent.clear(screen.getByRole('spinbutton'));
    await submit();

    await waitFor(() => expect(callback).toHaveBeenCalledWith({ limit: null }));
  });

  it('blocks clearing a numeric field that has a required validator', async () => {
    // A non-null numeric column: clearing must be stopped in the dialog, not
    // sent as null for the server to reject.
    const callback = vi.fn().mockResolvedValue({});
    renderDialog({
      scope: { lookback_years: 3 },
      name: 'lookback_years',
      callback,
      fieldComponent: NumberField as any,
      fieldProps: { min: 1, validate: required },
      emptyValue: null,
    });

    await userEvent.clear(screen.getByRole('spinbutton'));

    expect(screen.getByRole('button', { name: /confirm/i })).toBeDisabled();
    expect(callback).not.toHaveBeenCalled();
  });

  it('still submits the typed value for a non-empty edit', async () => {
    const callback = vi.fn().mockResolvedValue({});
    renderDialog({
      scope: { organization: 'AI Platform Services' },
      name: 'organization',
      callback,
      emptyValue: '',
    });

    const input = screen.getByRole('textbox');
    await userEvent.clear(input);
    await userEvent.type(input, 'Acme Ltd');
    await submit();

    await waitFor(() =>
      expect(callback).toHaveBeenCalledWith({ organization: 'Acme Ltd' }),
    );
  });

  it('falls back to an empty string when no emptyValue is supplied', async () => {
    const callback = vi.fn().mockResolvedValue({});
    renderDialog({
      scope: { job_title: 'Platform Administrator' },
      name: 'job_title',
      callback,
    });

    await userEvent.clear(screen.getByRole('textbox'));
    await submit();

    await waitFor(() =>
      expect(callback).toHaveBeenCalledWith({ job_title: '' }),
    );
  });

  it('writes the cleared value at a nested path', async () => {
    const callback = vi.fn().mockResolvedValue({});
    renderDialog({
      scope: { service_attributes: { backend_url: 'https://example.com' } },
      name: 'service_attributes.backend_url',
      callback,
      emptyValue: '',
    });

    await userEvent.clear(screen.getByRole('textbox'));
    await submit();

    await waitFor(() =>
      expect(callback).toHaveBeenCalledWith({
        service_attributes: { backend_url: '' },
      }),
    );
  });
});
