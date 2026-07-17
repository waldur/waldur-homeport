import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userPermissionsList } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { mockListResponse } from '@/test/utils';
import * as workspaceHooks from '@/workspace/hooks';
import { Customer } from '@/workspace/types';

import { OrganizationExpandableRow } from './OrganizationExpandableRow';

const customer = { uuid: 'cust-1' } as Customer;

const permission = {
  uuid: 'perm-1',
  role_description: 'Organization owner',
  role_name: 'CUSTOMER.OWNER',
  scope_type: 'customer',
  scope_uuid: 'cust-1',
  created: '2025-01-15T10:00:00Z',
  created_by_full_name: 'Alice Admin',
  created_by_username: 'alice',
  expiration_time: null,
};

describe('OrganizationExpandableRow', () => {
  beforeEach(() => {
    vi.mocked(workspaceHooks.useUser).mockReturnValue({
      uuid: 'me-uuid',
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // The `me` bootstrap payload no longer carries provenance fields
  // (role_description / created_by_* / created). This row must read them from
  // the full user-permissions endpoint, scoped to the current user + org.
  it('renders provenance from the full user-permissions endpoint', async () => {
    vi.mocked(userPermissionsList).mockResolvedValue(
      mockListResponse([permission]),
    );

    renderWithProviders(<OrganizationExpandableRow row={customer} />);

    expect(await screen.findByText('Organization owner')).toBeInTheDocument();
    expect(screen.getByText('Alice Admin')).toBeInTheDocument();
    expect(userPermissionsList).toHaveBeenCalledWith({
      query: {
        user: 'me-uuid',
        scope_type: 'customer',
        scope_uuid: 'cust-1',
      },
    });
  });

  it('shows the empty state when the user holds no role on the org', async () => {
    vi.mocked(userPermissionsList).mockResolvedValue(mockListResponse([]));

    renderWithProviders(<OrganizationExpandableRow row={customer} />);

    expect(await screen.findByText('No permissions data.')).toBeInTheDocument();
  });

  it('shows an error state when the endpoint fails', async () => {
    vi.mocked(userPermissionsList).mockRejectedValue(new Error('boom'));

    renderWithProviders(<OrganizationExpandableRow row={customer} />);

    expect(
      await screen.findByText('Unable to load permissions data.'),
    ).toBeInTheDocument();
  });
});
