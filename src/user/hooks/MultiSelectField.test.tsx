import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { MultiSelectField } from './MultiSelectField';
import { EventGroupOption } from './types';

const options: EventGroupOption[] = [
  {
    key: 'auth',
    title: 'Sign-ins and access tokens',
    description: 'Sign-ins and sign-outs.',
    section: 'access',
  },
  {
    key: 'invoices',
    title: 'Invoices',
    description: 'Invoices being paid.',
    section: 'billing',
  },
  { key: 'future_group', title: 'Future group events' },
];

const renderField = (onChange = vi.fn()) =>
  renderWithProviders(
    <MultiSelectField
      input={{ value: { invoices: true }, onChange }}
      options={options}
    />,
  );

describe('MultiSelectField', () => {
  it('groups options into sections, unknown groups under Other', () => {
    renderField();
    const billing = screen.getByRole('group', { name: 'Billing' });
    expect(within(billing).getByLabelText('Invoices')).toBeChecked();
    expect(
      within(screen.getByRole('group', { name: 'Other' })).getByLabelText(
        'Future group events',
      ),
    ).not.toBeChecked();
  });

  it('narrows the list by title or description and clears the filter', async () => {
    renderField();
    const filter = screen.getByPlaceholderText('Filter events');
    await userEvent.type(filter, 'paid');
    expect(screen.getByLabelText('Invoices')).toBeInTheDocument();
    expect(screen.queryByLabelText('Sign-ins and access tokens')).toBeNull();

    await userEvent.clear(filter);
    await userEvent.type(filter, 'nothing matches');
    expect(screen.getByText('No events match the filter.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Clear filter' }));
    expect(
      screen.getByLabelText('Sign-ins and access tokens'),
    ).toBeInTheDocument();
  });

  it('keeps existing selections when another box is ticked', async () => {
    const onChange = vi.fn();
    renderField(onChange);
    await userEvent.click(screen.getByLabelText('Sign-ins and access tokens'));
    expect(onChange).toHaveBeenCalledWith({ invoices: true, auth: true });
  });
});
