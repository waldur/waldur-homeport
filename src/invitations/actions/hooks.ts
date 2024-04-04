import { useCallback, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAsyncFn } from 'react-use';

import { ENV } from '@waldur/configs/default';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { InvitationService } from '../InvitationService';

import { fetchUserDetails } from './api';
import { InvitationPolicyService } from './InvitationPolicyService';
import {
  GroupInvitationFormData,
  GroupInviteRow,
  InvitationContext,
  StoredUserDetails,
} from './types';

export const useInvitationCreateDialog = (context: InvitationContext) => {
  const dispatch = useDispatch();

  const [usersDetails, setUsersDetails] = useState<StoredUserDetails[]>([]);
  const [{ loading: fetchingUserDetails }, fetchUserDetailsCallback] =
    useAsyncFn(
      (user: GroupInviteRow) => {
        if (!user.civil_number || !user.tax_number) return;
        return fetchUserDetails(user.civil_number, user.tax_number).then(
          (value) => {
            const index = usersDetails.findIndex(
              (u) => u.civil_number === user.civil_number,
            );
            if (index > -1) {
              setUsersDetails((prev) => {
                prev.find((u) => u.civil_number === user.civil_number).details =
                  value;
                return prev;
              });
            } else {
              setUsersDetails((prev) =>
                prev.concat({
                  civil_number: user.civil_number,
                  details: value,
                }),
              );
            }
          },
        );
      },
      [usersDetails, setUsersDetails],
    );

  // Enabling/disabling roles toggles their 'is_active' property; therefore, we filter based on that property
  const roles = useMemo(
    () =>
      context.roles
        ? ENV.roles.filter((role) => context.roles.includes(role.name))
        : ENV.roles.filter(
            (role) =>
              InvitationPolicyService.canManageRole(context, role) &&
              role.is_active,
          ),
    [context],
  );
  const defaultRoleAndProject = useMemo(
    () => ({
      role: roles.length > 0 ? roles[0] : null,
      project:
        context.roleTypes.includes('project') &&
        (context.project || context.customer.projects?.[0]),
    }),
    [roles, context],
  );

  const [creationResult, setCreationResult] = useState(null);
  const createInvitations = useCallback(
    (formData: GroupInvitationFormData) => {
      return new Promise((resolve, reject) => {
        try {
          if (!formData.rows?.length) return;
          const promises = formData.rows.map((row) => {
            const payload: Record<string, any> = {};
            payload.email = row.email;
            payload.extra_invitation_text = formData.extra_invitation_text;
            payload.role = row.role_project.role.uuid;
            if (row.role_project.role.content_type === 'project') {
              payload.scope = row.role_project.project.url;
            } else if (row.role_project.role.content_type === 'customer') {
              payload.scope = context.customer.url;
            } else if (context.scope) {
              payload.scope = context.scope.url;
            }
            return InvitationService.createInvitation(payload);
          });
          Promise.all(promises)
            .then((res) => {
              if (Array.isArray(res)) {
                // We need just one of invitation results
                setCreationResult(res[0]?.data);
              }
              dispatch(showSuccess('Invitations has been created.'));
              if (context.refetch) {
                context.refetch();
              }
              resolve(true);
            })
            .catch((e) => {
              dispatch(showErrorResponse(e, 'Unable to create invitation.'));
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
    creationResult,
    finish,
    roles,
    defaultRoleAndProject,
    fetchUserDetailsCallback,
    fetchingUserDetails,
    usersDetails,
  };
};
