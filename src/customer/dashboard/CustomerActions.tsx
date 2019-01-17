import * as React from 'react';

import { $state } from '@waldur/core/services';
import { ActionList } from '@waldur/dashboard/ActionList';
import { translate } from '@waldur/i18n';
import { $uibModal } from '@waldur/modal/services';
import { User, Customer } from '@waldur/workspace/types';

interface CustomerActionsProps {
  user: User;
  customer: Customer;
}

const getInviteAction = (props: CustomerActionsProps) => {
  const isStaff = props.user.is_staff;
  const isOwner = props.customer.owners.find(owner => owner.uuid === props.user.uuid);
  if (!isStaff && !isOwner) {
    return null;
  }
  return {
    title: translate('Invite team member'),
    onClick() {
      $uibModal.open({
        component: 'invitationDialog',
        resolve: {
          context: () => ({...props, isStaff, isOwner}),
        },
      });
    },
  };
};

export const CustomerActions = (props: CustomerActionsProps) => (
  <ActionList actions={[
    {
      title: translate('Add project'),
      onClick() {
        $state.go('organization.createProject');
      },
    },
    getInviteAction(props),
    {
      title: translate('Report issue'),
      onClick() {
        $state.go('organization.issues');
      },
    },
  ].filter(action => action !== null)}/>
);
