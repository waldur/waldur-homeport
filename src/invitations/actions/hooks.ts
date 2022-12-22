import { useRouter } from '@uirouter/react';
import { useMemo, useEffect, useCallback } from 'react';
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
import {
  GROUP_INVITATION_CREATE_FORM_ID,
  INVITATION_CREATE_FORM_ID,
} from '@waldur/invitations/actions/constants';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { RootState } from '@waldur/store/reducers';

import { InvitationService } from '../InvitationService';

import { fetchUserDetails } from './api';
import { InvitationPolicyService } from './InvitationPolicyService';
import {
  civilNumberSelector,
  taxNumberSelector,
  roleSelector,
} from './selectors';
import { InvitationContext } from './types';

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
  if (context.project) {
    roles.splice(0, 1);
  }
  return roles.filter((role) =>
    InvitationPolicyService.canManageRole(context, role),
  );
};

export const useInvitationCreateDialog = (context: InvitationContext) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const civilNumber = useSelector(civilNumberSelector);
  const taxNumber = useSelector(taxNumberSelector);
  const role = useSelector((state: RootState) =>
    roleSelector(state, INVITATION_CREATE_FORM_ID),
  );
  const [
    { loading: fetchingUserDetails, value: userDetails },
    fetchUserDetailsCallback,
  ] = useAsyncFn(
    () => fetchUserDetails(civilNumber, taxNumber),
    [civilNumber, taxNumber],
  );

  const roles = useMemo(() => getRoles(context), [context]);
  useEffect(() => {
    dispatch(change(INVITATION_CREATE_FORM_ID, 'role', roles[0].value));
    if (context.project) {
      dispatch(change(INVITATION_CREATE_FORM_ID, 'project', context.project));
    }
  }, [dispatch, roles, context]);

  const roleDisabled =
    isFeatureVisible('invitation.require_user_details') && !userDetails;
  const projectEnabled = PROJECT_ROLES.includes(role) && !roleDisabled;

  const createInvitation = useCallback(
    async (formData) => {
      try {
        const payload: Record<string, any> = {};
        payload.email = formData.email;
        payload.civil_number = formData.civil_number;
        payload.tax_number = formData.tax_number;
        if (PROJECT_ROLES.includes(role)) {
          payload.project_role = role;
          payload.project = formData.project.url;
        } else {
          payload.customer_role = role;
          payload.customer = context.customer.url;
        }
        if (userDetails) {
          Object.assign(payload, userDetails);
        }
        await InvitationService.createInvitation(payload);
        dispatch(closeModalDialog());
        router.stateService.go('organization.team');
        dispatch(showSuccess('Invitation has been created.'));
        if (context.refreshList) {
          context.refreshList();
        }
      } catch (e) {
        dispatch(showErrorResponse(e, 'Unable to create invitation.'));
      }
    },
    [dispatch, router.stateService, context.customer, userDetails, role],
  );

  return {
    fetchUserDetailsCallback,
    fetchingUserDetails,
    userDetails,
    createInvitation,
    roleDisabled,
    roles,
    projectEnabled,
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
        if (context.refreshList) {
          context.refreshList();
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
