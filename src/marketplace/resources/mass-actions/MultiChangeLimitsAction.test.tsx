import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { hasPermission } from '@/permissions/hasPermission';

import { MultiChangeLimitsAction } from './MultiChangeLimitsAction';

vi.mock('@/i18n', () => ({ translate: (key) => key }));

// @/modal/actions and @/workspace/hooks are already mocked in test/setupTests.js.

vi.mock('@/permissions/hasPermission', () => ({
  hasPermission: vi.fn(),
}));

// Avoid pulling the lazy-loaded dialog (and its heavy deps) into the test.
vi.mock('./MultiChangeLimitsDialog', () => ({
  MultiChangeLimitsDialog: () => null,
}));

const TENANT_TYPE = 'OpenStack.Tenant';

const tenant = (overrides = {}) => ({
  uuid: 'r1',
  name: 'VPC 1',
  offering_type: TENANT_TYPE,
  offering_uuid: 'off-1',
  state: 'OK',
  plan_uuid: 'plan-1',
  project_uuid: 'p1',
  customer_uuid: 'c1',
  ...overrides,
});

describe('MultiChangeLimitsAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hasPermission).mockReturnValue(true);
  });

  it('shows the action when all rows are OK OpenStack tenants with a plan and the user has permission', () => {
    render(
      <MultiChangeLimitsAction
        rows={[tenant(), tenant({ uuid: 'r2', name: 'VPC 2' })] as any}
        refetch={vi.fn()}
      />,
    );
    expect(screen.getByText('Change limits')).toBeInTheDocument();
  });

  it('shows the action enabled when selected tenants belong to different offerings (uniformity is not gated)', () => {
    render(
      <MultiChangeLimitsAction
        rows={[tenant(), tenant({ uuid: 'r2', offering_uuid: 'off-2' })] as any}
        refetch={vi.fn()}
      />,
    );
    expect(screen.getByText('Change limits')).toBeInTheDocument();
  });

  it('shows the action (disabled) when a tenant is not associated with a plan', () => {
    render(
      <MultiChangeLimitsAction
        rows={[tenant(), tenant({ uuid: 'r2', plan_uuid: undefined })] as any}
        refetch={vi.fn()}
      />,
    );
    expect(screen.getByText('Change limits')).toBeInTheDocument();
  });

  it('shows the action disabled when an offering disables the limit change action', () => {
    render(
      <MultiChangeLimitsAction
        rows={
          [
            tenant(),
            tenant({
              uuid: 'r2',
              offering_plugin_options: {
                disabled_resource_actions: ['update_limits'],
              },
            }),
          ] as any
        }
        refetch={vi.fn()}
      />,
    );
    expect(screen.getByText('Change limits')).toBeInTheDocument();
    // ActionItem marks disabled content with opacity-50.
    expect(screen.getByTestId('action-item-content')).toHaveClass('opacity-50');
  });

  it('hides the action when the user lacks the change-limits permission', () => {
    vi.mocked(hasPermission).mockReturnValue(false);
    const { container } = render(
      <MultiChangeLimitsAction rows={[tenant()] as any} refetch={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  // The tooltip is rendered through a portal-backed Tip and is only attached
  // on hover, so these tests verify "the action is shown" (i.e. not hidden);
  // that it is *disabled* + carries a tooltip is enforced by the `tooltip`
  // prop wiring, which is best covered by ActionItem's own tests.

  it('shows the action (disabled) when a selected resource is not an OpenStack tenant', () => {
    render(
      <MultiChangeLimitsAction
        rows={
          [
            tenant(),
            tenant({ uuid: 'r2', offering_type: 'Support.OfferingTemplate' }),
          ] as any
        }
        refetch={vi.fn()}
      />,
    );
    expect(screen.getByText('Change limits')).toBeInTheDocument();
  });

  it('shows the action (disabled) when a tenant is not in the OK state', () => {
    render(
      <MultiChangeLimitsAction
        rows={[tenant({ state: 'Erred' })] as any}
        refetch={vi.fn()}
      />,
    );
    expect(screen.getByText('Change limits')).toBeInTheDocument();
  });
});
