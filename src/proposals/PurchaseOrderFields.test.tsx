import { screen } from '@testing-library/react';
import { Form } from 'react-final-form';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { PurchaseOrderFields } from './PurchaseOrderFields';

/**
 * The submit button mirrors WizardForm, which disables on the form's global
 * `invalid`. That is why a validator on the purchase order reference used to
 * take the whole resource request form down with it.
 */
const renderFields = (props: {
  isRequired: boolean;
  existingAttachment?: string;
}) =>
  renderWithProviders(
    <Form
      onSubmit={() => undefined}
      render={({ invalid }) => (
        <form>
          <PurchaseOrderFields {...props} />
          <button type="submit" disabled={invalid}>
            Create
          </button>
        </form>
      )}
    />,
  );

describe('PurchaseOrderFields', () => {
  it('lets the request be saved while the purchase order is still missing', () => {
    renderFields({ isRequired: true });

    // The applicant assembles the amounts first and attaches the authorisation
    // later; the requirement is enforced at proposal submission instead.
    expect(screen.getByRole('button', { name: 'Create' })).toBeEnabled();
  });

  it('surfaces the document already stored on the request', () => {
    renderFields({
      isRequired: true,
      existingAttachment: 'https://example.com/po.pdf',
    });

    expect(
      screen.getByRole('link', { name: /Currently attached document/ }),
    ).toHaveAttribute('href', 'https://example.com/po.pdf');
  });
});
