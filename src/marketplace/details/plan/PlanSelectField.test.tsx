import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'react-final-form';
import { describe, expect, it } from 'vitest';
import { PublicOfferingDetails } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { PlanSelectField } from './PlanSelectField';

const limitOffering = {
  type: 'OpenStack.Tenant',
  components: [
    { type: 'cores', name: 'Cores', billing_type: 'limit', is_builtin: true },
    { type: 'ram', name: 'RAM', billing_type: 'limit', is_builtin: true },
  ],
} as unknown as PublicOfferingDetails;

const plan = (name: string, billing_mode: string) =>
  ({
    name,
    url: `/api/marketplace-plans/${name}/`,
    billing_mode,
    components: [],
  }) as any;

const renderField = (plans, offering) =>
  renderWithProviders(
    <Form onSubmit={() => undefined}>
      {() => <PlanSelectField plans={plans} offering={offering} />}
    </Form>,
  );

const openMenu = async () => {
  await userEvent.click(screen.getByRole('combobox'));
};

describe('PlanSelectField billing mode badge', () => {
  it('is left out when every plan bills the same way', async () => {
    // The badge tells plans apart; repeating it says nothing about the choice.
    renderField(
      [plan('Small Cloud', 'inherit'), plan('Large Cloud', 'inherit')],
      limitOffering,
    );
    await openMenu();
    expect(await screen.findByText('Small Cloud')).toBeInTheDocument();
    expect(screen.queryByText('Limit-based (monthly)')).toBeNull();
  });

  it('is shown once the plans differ', async () => {
    renderField(
      [plan('Reserved', 'limit'), plan('Pay as you go', 'usage')],
      limitOffering,
    );
    await openMenu();
    expect(await screen.findByText('Reserved')).toBeInTheDocument();
    expect(screen.getByText('Limit-based (monthly)')).toBeInTheDocument();
    expect(screen.getByText('Usage-based')).toBeInTheDocument();
  });

  it('is left out when no offering is given', async () => {
    renderField(
      [plan('Reserved', 'limit'), plan('Pay as you go', 'usage')],
      undefined,
    );
    await openMenu();
    expect(await screen.findByText('Reserved')).toBeInTheDocument();
    expect(screen.queryByText('Usage-based')).toBeNull();
  });
});
