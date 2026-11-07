import { useQuery } from '@tanstack/react-query';
import { rolesList } from 'waldur-js-client';

import { getAllPages } from '@/core/api';
import { translate } from '@/i18n';
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

/**
 * What holding `role` on an offering lets a person do, for the system roles;
 * an organization's own roles say it in their description.
 */
export const offeringRoleSummary = (role: Pick<Role, 'name'>) => {
  switch (role.name) {
    case 'OFFERING.MANAGER':
      return translate(
        'Manages the offering: its settings, plans, orders and team, and its part in calls for proposals.',
      );
    case 'OFFERING.EVALUATOR':
      return translate(
        "Can be handed the offering's part in calls for proposals, such as a technical assessment. Sees nothing of the offering's settings, orders or team.",
      );
    default:
      return undefined;
  }
};
