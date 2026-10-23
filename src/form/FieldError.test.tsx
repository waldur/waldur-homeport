import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FormField, FormLabel, Input } from 'waldur-ui';

import { FieldError } from './FieldError';
import { FieldWarning } from './FieldWarning';

describe('FieldError', () => {
  // Linking the message to its control (aria-describedby) reads it when the
  // control is focused; the alert role is what announces it when it appears.
  it('is an alert, so it is announced when it appears', () => {
    render(<FieldError error="Required" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
  });

  it('renders nothing, and no empty alert, without an error', () => {
    render(<FieldError error={undefined} />);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('announces an error that appears after the field is on screen', () => {
    const { rerender } = render(
      <FormField>
        <FormLabel>Name</FormLabel>
        <Input />
        <FieldError error={undefined} />
      </FormField>,
    );
    expect(screen.queryByRole('alert')).toBeNull();
    rerender(
      <FormField>
        <FormLabel>Name</FormLabel>
        <Input />
        <FieldError error="Too short" />
      </FormField>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Too short');
    // and it still describes the control.
    expect(screen.getByLabelText('Name')).toHaveAccessibleDescription(
      'Too short',
    );
  });
});

describe('FieldWarning', () => {
  it('is a polite status, not an alert', () => {
    render(<FieldWarning error="Looks unusual" />);
    expect(screen.getByRole('status')).toHaveTextContent('Looks unusual');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  // API field names become labels: snake_case and camelCase split into words.
  it('labels each field of an object error by its readable name', () => {
    render(
      <FieldError
        error={{
          backend_url: ['Enter a valid URL.'],
          maxNodeCount: ['Too many.'],
        }}
      />,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Backend url: Enter a valid URL.');
    expect(alert).toHaveTextContent('Max node count: Too many.');
  });
});
