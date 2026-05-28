import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import * as workspaceHooks from '@/workspace/hooks';

import { HypervisorPlacementMapButton } from './HypervisorPlacementMapButton';

const renderButton = (isStaff: boolean) => {
  vi.mocked(workspaceHooks.useUser).mockReturnValue({
    is_staff: isStaff,
  } as any);
  return render(<HypervisorPlacementMapButton tenantUuid="test-tenant-uuid" />);
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
    vi.mocked(workspaceHooks.useUser).mockReturnValue(null as any);
    render(<HypervisorPlacementMapButton tenantUuid="test-tenant-uuid" />);
    expect(screen.queryByText('Placement map')).toBeNull();
  });
});
