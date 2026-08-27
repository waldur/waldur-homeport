import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';

import { EditPlanQuotasButton } from './EditPlanQuotasButton';

const openDialog = vi.fn();

const component = (type, billing_type, is_prepaid = false) => ({
  type,
  name: type,
  billing_type,
  is_prepaid,
  measured_unit: 'unit',
});

const renderButton = (components) =>
  renderWithProviders(
    <EditPlanQuotasButton
      offering={{ components }}
      plan={{ uuid: 'plan-1', quotas: {} }}
      refetch={vi.fn()}
    />,
  );

const shownComponents = async () => {
  await userEvent.click(screen.getByText('Edit quotas'));
  return openDialog.mock.calls[0][1].resolve.components.map((c) => c.type);
};

// The set below must stay identical to what QuotasUpdateSerializer.save
// accepts. The dialog posts every row it shows in a single payload, so one
// component the backend refuses fails the whole save — including the rows that
// were valid.
describe('EditPlanQuotasButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useModal as Mock).mockReturnValue({
      openDialog,
      closeDialog: vi.fn(),
    });
  });

  it('offers the billing types charged at the plan amount', async () => {
    renderButton([
      component('licence', 'fixed'),
      component('setup', 'one'),
      component('migration', 'few'),
    ]);

    expect(await shownComponents()).toEqual(['licence', 'setup', 'migration']);
  });

  it('leaves out usage and limit components', async () => {
    renderButton([
      component('licence', 'fixed'),
      component('cpu_hours', 'usage'),
      component('storage', 'limit'),
    ]);

    expect(await shownComponents()).toEqual(['licence']);
  });

  it('leaves out prepaid components whatever their billing type', async () => {
    // The quantity of a prepaid component is the requested limit times the
    // subscription length, so an amount set here would be ignored. The backend
    // excludes it for every billing type, not just one-time.
    renderButton([
      component('licence', 'fixed'),
      component('support_years', 'one', true),
      component('seats', 'fixed', true),
      component('switch', 'few', true),
    ]);

    expect(await shownComponents()).toEqual(['licence']);
  });

  it('renders nothing when no component can carry an amount', () => {
    renderButton([
      component('cpu_hours', 'usage'),
      component('support_years', 'one', true),
    ]);

    expect(screen.queryByText('Edit quotas')).not.toBeInTheDocument();
  });
});
