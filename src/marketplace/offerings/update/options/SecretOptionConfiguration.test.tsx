import { render, screen } from '@testing-library/react';
import { Form } from 'react-final-form';
import { describe, expect, it } from 'vitest';

import { SecretOptionConfiguration } from './SecretOptionConfiguration';

const renderWith = (default_configs = {}) =>
  render(
    <Form
      onSubmit={() => {}}
      initialValues={{ default_configs }}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <SecretOptionConfiguration />
        </form>
      )}
    />,
  );

const revealSwitch = () =>
  screen.getByRole('checkbox', { name: /Customers may reveal it/ }) as
    HTMLInputElement | undefined;

describe('SecretOptionConfiguration', () => {
  it('shows the server default for reveal: off for a customer secret', () => {
    renderWith();
    expect(revealSwitch()).not.toBeChecked();
    expect(screen.getByPlaceholderText('4096')).toBeInTheDocument();
  });

  it('shows the server default for reveal: on for a provider secret', () => {
    renderWith({ secret_source: 'provider' });
    expect(revealSwitch()).toBeChecked();
    expect(
      screen.getByText(/you or your site agent set it on the resource/),
    ).toBeInTheDocument();
  });

  it('keeps an explicit choice', () => {
    renderWith({ secret_source: 'provider', customer_can_reveal: false });
    expect(revealSwitch()).not.toBeChecked();
  });
});
