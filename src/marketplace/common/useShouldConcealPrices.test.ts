import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { projectsRetrieve } from 'waldur-js-client';

import { createTestWrapper } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { useShouldConcealPrices } from './useShouldConcealPrices';

const role = (scope_type: string, scope_uuid: string) => ({
  role_name: 'ANY',
  scope_type,
  scope_uuid,
});

const users = {
  providerManager: {
    is_staff: false,
    permissions: [role('service_provider', 'provider-uuid')],
  },
  projectMember: {
    is_staff: false,
    permissions: [role('project', 'project-uuid')],
  },
  owner: {
    is_staff: false,
    permissions: [role('customer', 'customer-uuid')],
  },
};

const render = (name: keyof typeof users) => {
  vi.mocked(useUser).mockReturnValue(users[name] as any);
  const { wrapper } = createTestWrapper();
  return renderHook(
    () => useShouldConcealPrices('project-uuid', 'customer-uuid'),
    { wrapper },
  );
};

describe('useShouldConcealPrices', () => {
  beforeEach(() => {
    vi.mocked(projectsRetrieve).mockReset();
    vi.mocked(projectsRetrieve).mockResolvedValue({
      data: { customer_display_billing_info_in_projects: false },
    } as any);
  });

  it('does not look up the consumer project for a provider-only user', async () => {
    const { result } = render('providerManager');

    // Give a request the chance to go out before asserting none did.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(projectsRetrieve).not.toHaveBeenCalled();
    expect(result.current).toBe(false);
  });

  it.each(['projectMember', 'owner'] as const)(
    'applies the consumer setting for a %s',
    async (name) => {
      const { result } = render(name);

      await waitFor(() => expect(result.current).toBe(true));
      expect(projectsRetrieve).toHaveBeenCalledWith(
        expect.objectContaining({ path: { uuid: 'project-uuid' } }),
      );
    },
  );
});
