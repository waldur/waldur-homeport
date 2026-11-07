import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { rolesList } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { AssignOfferingUserDialog } from './AssignOfferingUserDialog';

const offering = { uuid: 'off-1', customer_uuid: 'cust-1' } as any;

const role = (name: string, description: string) => ({
  uuid: name,
  name,
  description,
});

describe('AssignOfferingUserDialog', () => {
  it('names the only role it grants, and what it allows', async () => {
    vi.mocked(rolesList).mockResolvedValue({
      data: [role('OFFERING.MANAGER', 'Offering manager')],
      response: { headers: new Headers({ 'x-result-count': '1' }) },
    } as any);
    renderWithProviders(
      <AssignOfferingUserDialog resolve={{ offering, refetch: vi.fn() }} />,
    );
    expect(await screen.findByTestId('only-role')).toHaveTextContent(
      'Offering manager',
    );
    expect(
      screen.getByText(/its settings, plans, orders and team/),
    ).toBeInTheDocument();
  });
});
