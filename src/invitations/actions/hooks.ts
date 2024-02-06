import { useMemo, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAsyncFn } from 'react-use';

import { ENV } from '@waldur/configs/default';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { InvitationService } from '../InvitationService';

import { fetchUserDetails } from './api';
import { InvitationPolicyService } from './InvitationPolicyService';
import {
  GroupInviteRow,
  GroupInvitationFormData,
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

  const roles = useMemo(
    () =>
      ENV.roles.filter((role) =>
        InvitationPolicyService.canManageRole(context, role),
      ),
    [context],
  );
  const defaultRoleAndProject = useMemo(
    () =>
      context.project
        ? {
            role: roles.filter((role) => role.content_type === 'project')[0],
            project: context.project || context.customer.projects?.[0],
          }
        : {
            role: undefined,
            project: undefined,
          },
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
            } else {
              payload.scope = context.customer.url;
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
