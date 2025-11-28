import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { userInvitationsCreate } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { InvitationPolicyService } from './InvitationPolicyService';
import { GroupInvitationFormData, InvitationContext } from './types';

export const useInvitationCreateDialog = (context: InvitationContext) => {
  const dispatch = useDispatch();

  const defaultProject = useMemo(
    () =>
      context.roleTypes.includes('project') &&
      (context.project || context.customer.projects?.[0]),
    [context],
  );

  // Enabling/disabling roles toggles their 'is_active' property; therefore, we filter based on that property
  const roles = useMemo(() => {
    const _roles = context.roles
      ? ENV.roles.filter((role) => context.roles.includes(role.name))
      : ENV.roles.filter(
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
  }, [context, defaultProject]);

  const defaultRole = useMemo(
    () => (roles.length > 0 ? roles[0] : null),
    [roles, context],
  );

  const createInvitations = useCallback(
    (formData: GroupInvitationFormData) => {
      return new Promise((resolve, reject) => {
        try {
          if (!formData.rows?.length) return;

          // Filter out rows that don't have valid role_project data
          const validRows = formData.rows.filter(
            (row) => row.role_project && row.role_project.role && row.email,
          );

          if (validRows.length === 0) {
            reject(new Error('No valid invitations to send'));
            return;
          }

          const promises = validRows.map((row) => {
            let scope;
            if (row.role_project.role.content_type === 'project') {
              scope = row.role_project.project.url;
            } else if (row.role_project.role.content_type === 'customer') {
              scope = context.customer.url;
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
          Promise.all(promises)
            .then(() => {
              dispatch(
                showSuccess(
                  translate(
                    'All invitation emails have been successfully sent.',
                  ),
                  translate('Invitation emails sent'),
                ),
              );
              if (context.refetch) {
                context.refetch();
              }
              resolve(true);
            })
            .catch((e) => {
              dispatch(
                showErrorResponse(e, translate('Unable to send invitations.')),
              );
              reject(e);
            });
        } catch (e) {
          reject(e);
        }
      });
    },
    [dispatch, context],
  );

  const finish = () => dispatch(closeModalDialog());

  return {
    createInvitations,
    finish,
    roles,
    defaultRole,
    defaultProject,
  };
};
