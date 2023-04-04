import { useRouter } from '@uirouter/react';
import { useMemo, useEffect, useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useAsyncFn } from 'react-use';
import { change } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import {
  CUSTOMER_OWNER_ROLE,
  PROJECT_ADMIN_ROLE,
  PROJECT_MANAGER_ROLE,
  PROJECT_MEMBER_ROLE,
  PROJECT_ROLES,
} from '@waldur/core/constants';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { GROUP_INVITATION_CREATE_FORM_ID } from '@waldur/invitations/actions/constants';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { RootState } from '@waldur/store/reducers';

import { InvitationService } from '../InvitationService';
import { Invitation } from '../types';

import { fetchUserDetails } from './api';
import { InvitationPolicyService } from './InvitationPolicyService';
import { roleSelector } from './selectors';
import {
  EmailInviteUser,
  GroupInvitationFormData,
  InvitationContext,
  StoredUserDetails,
} from './types';

const getRoles = (context) => {
  const roles = [
    {
      title: translate(ENV.roles.owner),
      value: CUSTOMER_OWNER_ROLE,
      icon: 'fa-sitemap',
    },
    {
      title: translate(ENV.roles.manager),
      value: PROJECT_MANAGER_ROLE,
      icon: 'fa-users',
    },
    {
      title: translate(ENV.roles.admin),
      value: PROJECT_ADMIN_ROLE,
      icon: 'fa-server',
    },
  ];
  if (isFeatureVisible('project.member_role')) {
    roles.push({
      title: translate(ENV.roles.member),
      value: PROJECT_MEMBER_ROLE,
      icon: 'fa-user-o',
    });
  }
  return roles.filter((role) =>
    InvitationPolicyService.canManageRole(context, role),
  );
};

export const useInvitationCreateDialog = (context: InvitationContext) => {
  const dispatch = useDispatch();

  const [usersDetails, setUsersDetails] = useState<StoredUserDetails[]>([]);
  const [{ loading: fetchingUserDetails }, fetchUserDetailsCallback] =
    useAsyncFn(
      (user: EmailInviteUser) => {
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

  const roles = useMemo(() => getRoles(context), [context]);
  const defaultRoleAndProject = useMemo(
    () =>
      context.project
        ? {
            role:
              roles.find((role) => role.value === PROJECT_MEMBER_ROLE) ||
              roles.find((role) => role.value === PROJECT_MANAGER_ROLE),
            project: context.project || context.customer.projects?.[0],
          }
        : {
            role: undefined,
            project: undefined,
          },
    [roles, context],
  );

  const [creationResult, setCreationResult] = useState<Invitation>(null);
  const createInvitations = useCallback(
    (formData: GroupInvitationFormData) => {
      return new Promise((resolve, reject) => {
        try {
          const users: EmailInviteUser[] = formData.users;
          if (!users?.length) return;
          const promises = [];
          users.forEach((user) => {
            const payload: Record<string, any> = {};
            payload.email = user.email;
            payload.extra_invitation_text = formData.extra_invitation_text;
            if (PROJECT_ROLES.includes(user.role_project.role)) {
              payload.project_role = user.role_project.role;
              payload.project = user.role_project.project.url;
            } else {
              payload.customer_role = user.role_project.role;
              payload.customer = context.customer.url;
            }
            promises.push(InvitationService.createInvitation(payload));
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

export const useGroupInvitationCreateDialog = (context: InvitationContext) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const role = useSelector((state: RootState) =>
    roleSelector(state, GROUP_INVITATION_CREATE_FORM_ID),
  );

  const roles = useMemo(() => getRoles(context), [context]);
  useEffect(() => {
    dispatch(change(GROUP_INVITATION_CREATE_FORM_ID, 'role', roles[0].value));
  }, [dispatch, roles]);

  const roleDisabled = isFeatureVisible('invitation.require_user_details');
  const projectEnabled = PROJECT_ROLES.includes(role) && !roleDisabled;

  const createInvitation = useCallback(
    async (formData) => {
      try {
        const payload: Record<string, string> = {};
        if (PROJECT_ROLES.includes(role)) {
          payload.project_role = role;
          payload.project = formData.project.url;
        } else {
          payload.customer_role = role;
          payload.customer = context.customer.url;
        }
        await InvitationService.createGroupInvitation(payload);
        dispatch(closeModalDialog());
        dispatch(showSuccess('Group invitation has been created.'));
        if (context.refetch) {
          context.refetch();
        }
      } catch (e) {
        dispatch(showErrorResponse(e, 'Unable to create group invitation.'));
      }
    },
    [dispatch, router.stateService, context.customer, role],
  );

  return {
    createInvitation,
    roles,
    projectEnabled,
  };
};
