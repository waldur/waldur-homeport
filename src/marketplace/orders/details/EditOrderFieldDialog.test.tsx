import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { EditOrderFieldDialog } from './EditOrderFieldDialog';

const mutateAsync = vi.fn();
vi.mock('@/modal/useManagedMutation', () => ({
  useManagedMutation: () => ({ mutateAsync }),
}));

const renderDialog = (component: Record<string, any>, value: number) =>
  renderWithProviders(
    <EditOrderFieldDialog
      resolve={{
        order: { uuid: 'order-1', resource_name: 'vm-1' } as any,
        offering: { components: [component] } as any,
        name: 'limits',
        component: component.type,
      }}
      initialValues={{ limits: { [component.type]: value } }}
    />,
  );

describe('EditOrderFieldDialog limits', () => {
  beforeEach(() => {
    mutateAsync.mockReset();
  });

  it('keeps the decimals of a fractional component', async () => {
    renderDialog(
      {
        type: 'storage',
        name: 'Storage',
        measured_unit: 'TB',
        limit_decimal_places: 1,
        max_value: 100,
      },
      1,
    );
    const field = screen.getByRole('spinbutton');
    await userEvent.clear(field);
    await userEvent.type(field, '2.5');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ limits: { storage: 2.5 } }),
    );
  });

  it('shows the unit and the validation error', async () => {
    renderDialog(
      { type: 'cores', name: 'Cores', measured_unit: 'cores', min_value: 4 },
      8,
    );
    expect(screen.getByText('cores')).toBeInTheDocument();

    const field = screen.getByRole('spinbutton');
    await userEvent.clear(field);
    await userEvent.type(field, '2');

    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
