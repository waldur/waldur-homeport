import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { projectsListUsersList } from 'waldur-js-client';

import { createTestWrapper } from '@/test/harness';
import { mockListResponse } from '@/test/utils';

import { useExistingRoles } from './useExistingRoles';

const adminRole = {
  uuid: 'admin-uuid',
  name: 'PROJECT.ADMIN',
  content_type: 'project',
} as any;

const managerRole = {
  uuid: 'manager-uuid',
  name: 'PROJECT.MANAGER',
  content_type: 'project',
} as any;

const renderExistingRoles = (role: any) => {
  const { wrapper } = createTestWrapper();
  return renderHook(
    ({ role: currentRole }) =>
      useExistingRoles({
        role: currentRole,
        userUuid: 'user-uuid',
        scopeUuid: 'project-uuid',
      }),
    { wrapper, initialProps: { role } },
  );
};

describe('useExistingRoles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(projectsListUsersList).mockResolvedValue(
      mockListResponse([
        { role_uuid: 'admin-uuid', role_name: 'PROJECT.ADMIN' },
      ]) as any,
    );
  });

  it('re-evaluates the verdict when the requested role changes', async () => {
    const { result, rerender } = renderExistingRoles(adminRole);

    await waitFor(() => expect(result.current.hits).toHaveLength(1));
    expect(result.current.hits[0]).toMatchObject({
      roleUuid: 'admin-uuid',
      isSameRole: true,
    });

    // Same scope and user, so the cached rows are reused — but the verdict is
    // computed against the newly requested role, not the one it was fetched for.
    rerender({ role: managerRole });

    await waitFor(() =>
      expect(result.current.hits[0]).toMatchObject({
        roleUuid: 'manager-uuid',
        isSameRole: false,
      }),
    );
    expect(projectsListUsersList).toHaveBeenCalledTimes(1);
  });

  it('reports that it is still checking while the lookup is in flight', async () => {
    const { result } = renderExistingRoles(adminRole);

    expect(result.current.isChecking).toBe(true);
    await waitFor(() => expect(result.current.isChecking).toBe(false));
  });

  it('stays idle for a scope without a list_users action', () => {
    const { wrapper } = createTestWrapper();
    const { result } = renderHook(
      () =>
        useExistingRoles({
          role: {
            uuid: 'r',
            name: 'OFFERING.MANAGER',
            content_type: 'offering',
          } as any,
          userUuid: 'user-uuid',
          scopeUuid: 'offering-uuid',
        }),
      { wrapper },
    );

    expect(result.current.isChecking).toBe(false);
    expect(result.current.hits).toEqual([]);
    expect(projectsListUsersList).not.toHaveBeenCalled();
  });
});
