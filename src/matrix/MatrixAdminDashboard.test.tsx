import { screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { adminMatrixAppserviceStatusRetrieve } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { MatrixAdminDashboard } from './MatrixAdminDashboard';

// Stub the shared TableWithTabs so the test sees the header actions the page
// builds, not the tab machinery.
vi.mock('@/table/TableWithTabs', () => ({
  TableWithTabs: ({ headerActions }: any) => <div>{headerActions}</div>,
}));

vi.mock('./utils', () => ({ isMatrixEnabled: () => true }));

const renderDashboard = (isStaff = true) => {
  const store = createStore(
    () => ({ workspace: { user: { is_staff: isStaff } } }) as any,
  );
  return renderWithProviders(
    <Provider store={store}>
      <MatrixAdminDashboard />
    </Provider>,
  );
};

const setupButton = () =>
  screen.queryByRole('button', { name: 'Setup appservice' });

describe('MatrixAdminDashboard', () => {
  beforeEach(() => {
    vi.mocked(adminMatrixAppserviceStatusRetrieve).mockReset();
  });

  it('offers Setup when the wizard owns the tokens', async () => {
    vi.mocked(adminMatrixAppserviceStatusRetrieve).mockResolvedValue({
      data: { tokens_managed_by: '' },
    } as any);

    renderDashboard();

    expect(
      await screen.findByRole('button', { name: 'Setup appservice' }),
    ).toBeInTheDocument();
  });

  it('hides Setup when the deployment owns the tokens', async () => {
    vi.mocked(adminMatrixAppserviceStatusRetrieve).mockResolvedValue({
      data: { tokens_managed_by: 'deployment' },
    } as any);

    renderDashboard();

    expect(
      await screen.findByRole('button', { name: 'Diagnostics' }),
    ).toBeInTheDocument();
    await vi.waitFor(() =>
      expect(adminMatrixAppserviceStatusRetrieve).toHaveBeenCalled(),
    );
    expect(setupButton()).not.toBeInTheDocument();
  });

  it('does not offer Setup before the status has loaded', () => {
    // Showing it while loading would flash it on exactly the deployments it
    // is hidden on.
    vi.mocked(adminMatrixAppserviceStatusRetrieve).mockReturnValue(
      new Promise(() => {}) as any,
    );

    renderDashboard();

    expect(setupButton()).not.toBeInTheDocument();
  });

  it('never asks non-staff for the staff-only status', () => {
    renderDashboard(false);

    expect(adminMatrixAppserviceStatusRetrieve).not.toHaveBeenCalled();
  });
});
