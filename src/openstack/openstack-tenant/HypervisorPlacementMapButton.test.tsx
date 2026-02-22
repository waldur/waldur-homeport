import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { describe, expect, it, vi } from 'vitest';

import { HypervisorPlacementMapButton } from './HypervisorPlacementMapButton';

const mockStore = configureMockStore();

vi.mock('@waldur/i18n', () => ({
  translate: (key) => key,
}));

const renderButton = (isStaff: boolean) => {
  const store = mockStore({
    workspace: {
      user: { is_staff: isStaff },
    },
  });
  return render(
    <Provider store={store}>
      <HypervisorPlacementMapButton tenantUuid="test-tenant-uuid" />
    </Provider>,
  );
};

describe('HypervisorPlacementMapButton', () => {
  it('renders button for staff users', () => {
    renderButton(true);
    expect(screen.getByText('Placement map')).toBeTruthy();
  });

  it('does not render button for non-staff users', () => {
    renderButton(false);
    expect(screen.queryByText('Placement map')).toBeNull();
  });

  it('does not render when user is null', () => {
    const store = mockStore({
      workspace: { user: null },
    });
    render(
      <Provider store={store}>
        <HypervisorPlacementMapButton tenantUuid="test-tenant-uuid" />
      </Provider>,
    );
    expect(screen.queryByText('Placement map')).toBeNull();
  });
});
