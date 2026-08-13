import { useQuery } from '@tanstack/react-query';
import { rolesList } from 'waldur-js-client';

import { getAllPages } from '@/core/api';
import { Role } from '@/permissions/types';

/**
 * Roles grantable on an offering scope: the system `OFFERING.MANAGER` plus any
 * org-private clone bound to the offering's organization. `available_for_customer`
 * makes the backend apply the same RoleAvailability allow-list and
 * CustomerRoleConcealment deny-list that `check_grant_policy` enforces at grant
 * time, so the picker cannot offer a role the grant would later reject.
 */
export const useOfferingRoles = (customerUuid: string | null | undefined) =>
  useQuery<Role[]>({
    queryKey: ['offering-scope-roles', customerUuid],
    queryFn: () =>
      getAllPages((page) =>
        rolesList({
          query: {
            content_type: 'offering',
            available_for_customer: customerUuid,
            is_active: true,
            page,
          },
        }),
      ),
    enabled: Boolean(customerUuid),
    staleTime: 5 * 60 * 1000,
  });
