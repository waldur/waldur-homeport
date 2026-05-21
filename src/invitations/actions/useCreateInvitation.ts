import { useMemo } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { useCustomerProjects } from '@/customer/workspace/fetchCustomer';
import { useModal } from '@/modal/actions';
import { PermissionMap } from '@/permissions/enums';
import { checkScope } from '@/permissions/hasPermission';
import { useUser, useCustomer, useProject } from '@/workspace/hooks';

import { InvitationContext } from './types';

const InvitationCreateDialog = lazyComponent(() =>
  import('./create/InvitationCreateDialog').then((module) => ({
    default: module.InvitationCreateDialog,
  })),
);

export const useCreateInvitation = (
  context: Omit<InvitationContext, 'customer' | 'user'>,
) => {
  const user = useUser();
  const customer = useCustomer();
  const { loading: loadingProjects } = useCustomerProjects();
  const project = useProject();
  const { openDialog } = useModal();
  const callback = () =>
    openDialog(InvitationCreateDialog, {
      size: 'xl',
      resolve: { ...context, user, customer },
    });

  const canInvite = useMemo(
    () =>
      context.roleTypes.some((roleType) => {
        let scope: any = context.scope;
        if (roleType === 'call_organizer') {
          scope = context.scope.manager_uuid;
        }
        if (!scope) {
          switch (roleType) {
            case 'customer':
              scope = customer;
              break;
            case 'project':
              scope = context.project || project;
              break;
            default:
              return false;
          }
        }
        const permission = PermissionMap[roleType];
        return (
          (customer &&
            checkScope(user, 'customer', customer.uuid, permission)) ||
          (scope && checkScope(user, roleType, scope.uuid, permission)) ||
          (scope &&
            typeof scope === 'string' &&
            checkScope(user, roleType, scope, permission))
        );
      }),
    [context, user, customer, project],
  );

  return { callback, canInvite, loadingProjects };
};
