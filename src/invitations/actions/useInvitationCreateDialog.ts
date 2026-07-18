import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { rolesList, userInvitationsCreate } from 'waldur-js-client';
import { userInvitationsCheckDuplicates } from 'waldur-js-client';

import { getAllPages } from '@/core/api';
import { ENV } from '@/core/config';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { InvitationPolicyService } from './InvitationPolicyService';
import { GroupInvitationFormData, InvitationContext } from './types';

export const useInvitationCreateDialog = (context: InvitationContext) => {
  const defaultProject = useMemo(
    () =>
      context.roleTypes?.includes('project') &&
      (context.project || context.customer?.projects?.[0]),
    [context],
  );

  // When inviting into an organization, offer that org's roles (system +
  // org-private clones, minus concealed). The global ENV.roles list is not used
  // here because it would expose other organizations' private roles.
  const customerUuid = context.customer?.uuid;
  const { data: scopedRoles } = useQuery({
    queryKey: ['available-roles-for-customer', customerUuid],
    queryFn: () =>
      getAllPages((page) =>
        rolesList({ query: { available_for_customer: customerUuid, page } }),
      ),
    enabled: Boolean(customerUuid) && !context.rolesOverride,
    staleTime: 5 * 60 * 1000,
  });

  // Enabling/disabling roles toggles their 'is_active' property; therefore, we filter based on that property
  const roles = useMemo(() => {
    if (context.rolesOverride) {
      // Scoped caller (e.g. resource invite) supplied a backend-filtered list;
      // use it verbatim and skip ENV.roles + policy filtering.
      return context.rolesOverride.filter((role) => role.is_active !== false);
    }
    // Fall back to [] (not ENV.roles) while the scoped fetch is in flight, so
    // no other organization's clones flash into the picker.
    const baseRoles = customerUuid ? (scopedRoles ?? []) : ENV.roles;
    const _roles = context.roles
      ? baseRoles.filter((role) => context.roles.includes(role.name))
      : baseRoles.filter(
          (role) =>
            InvitationPolicyService.canManageRole(context, role) &&
            role.is_active,
        );
    if (defaultProject) {
      return _roles;
    }
    return _roles.map((role) => ({
      ...role,
      is_active: !role.name.startsWith('PROJECT'),
      tooltip: translate('There are no projects.'),
    }));
  }, [context, defaultProject, customerUuid, scopedRoles]);

  const defaultRole = useMemo(
    () => (roles.length > 0 ? roles[0] : null),
    [roles, context],
  );

  const getScopeForRow = useCallback(
    (row: GroupInvitationFormData['rows'][0]) => {
      if (!row?.role_project?.role) return null;
      if (row.role_project.role.content_type === 'project') {
        return row.role_project.project?.url ?? null;
      }
      if (row.role_project.role.content_type === 'customer') {
        return context.customer?.url ?? null;
      }
      return context.scope?.url ?? null;
    },
    [context],
  );

  const checkDuplicates = useCallback(
    async (
      formData: GroupInvitationFormData,
    ): Promise<Array<{ email: string; roleUuid: string }>> => {
      const validRows = (formData.rows ?? []).filter(
        (row) => row?.email && row?.role_project?.role,
      );
      if (validRows.length === 0) return [];

      const byScope = new Map<string, { email: string; role: string }[]>();
      for (const row of validRows) {
        const scope = getScopeForRow(row);
        if (!scope) continue;
        const list = byScope.get(scope) ?? [];
        list.push({
          email: row.email,
          role: row.role_project.role.uuid,
        });
        byScope.set(scope, list);
      }

      const duplicatePairs: Array<{ email: string; roleUuid: string }> = [];
      await Promise.all(
        Array.from(byScope.entries()).map(async ([scope, invitations]) => {
          const response = await userInvitationsCheckDuplicates({
            body: { scope, invitations },
          });
          const data = response.data;
          if (data?.duplicates?.length) {
            duplicatePairs.push(
              ...data.duplicates.map((d) => ({
                email: d.email,
                roleUuid: d.role,
              })),
            );
          }
        }),
      );
      return duplicatePairs;
    },
    [getScopeForRow],
  );

  const { mutateAsync: createInvitations } = useManagedMutation<
    any[],
    any,
    GroupInvitationFormData
  >({
    mutationFn: (formData) => {
      const promises = formData.rows.map((row) => {
        let scope;
        if (row.role_project.role.content_type === 'project') {
          scope = row.role_project.project?.url;
        } else if (row.role_project.role.content_type === 'customer') {
          scope = context.customer?.url;
        } else if (context.scope) {
          scope = context.scope.url;
        }
        return userInvitationsCreate({
          body: {
            role: row.role_project.role.uuid,
            email: row.email,
            extra_invitation_text: formData.extra_invitation_text,
            scope,
          },
        });
      });
      return Promise.all(promises);
    },
    successMessage: translate(
      'All invitation emails have been successfully sent.',
    ),
    errorMessage: translate('Unable to send invitations.'),
    refetch: context.refetch,
  });

  return {
    checkDuplicates,
    createInvitations,
    roles,
    defaultRole,
    defaultProject,
  };
};
