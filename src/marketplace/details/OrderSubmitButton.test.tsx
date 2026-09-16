import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FORM_ERROR } from 'final-form';
import { Field, Form } from 'react-final-form';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { OrderSubmitButton } from './OrderSubmitButton';

// FloatingButton watches its own visibility, which jsdom has no API for.
window.IntersectionObserver = class {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
} as any;

// FloatingButton renders its children twice -- once inline, once in the mobile
// bar -- so every query here is plural and asserts on the first copy.
const createButton = () =>
  screen.getAllByRole('button', { name: /Create/ })[0] as HTMLButtonElement;

const renderForm = (onSubmit) =>
  renderWithProviders(
    <Form onSubmit={onSubmit} initialValues={{ attributes: { name: 'x' } }}>
      {({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <Field name="attributes.name" component="input" />
          <OrderSubmitButton />
        </form>
      )}
    </Form>,
  );

describe('OrderSubmitButton after a rejected order', () => {
  // The API refusing an order used to leave the button permanently disabled:
  // final-form counts submitErrors towards `invalid` and only clears them on
  // the next submit, which this button is the sole way to trigger. Reloading
  // the page was the only escape.
  it('lets the order be retried once something is edited', async () => {
    const onSubmit = () => ({
      [FORM_ERROR]: 'Unable to submit order.',
      non_field_errors: ['RAM limit is mandatory.'],
    });
    renderForm(onSubmit);

    expect(createButton()).toBeEnabled();

    await userEvent.click(createButton());
    expect(createButton()).toBeDisabled();

    // Editing anything means the rejection no longer describes what would be
    // sent, so the button has to come back.
    await userEvent.type(screen.getByRole('textbox'), 'y');
    expect(createButton()).toBeEnabled();
  });

  it('stays enabled when the order is accepted', async () => {
    renderForm(() => undefined);

    await userEvent.click(createButton());

    expect(createButton()).toBeEnabled();
  });
});
