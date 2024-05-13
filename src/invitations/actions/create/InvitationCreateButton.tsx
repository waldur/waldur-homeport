import { PlusCircle } from '@phosphor-icons/react';
import { FunctionComponent, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionMap } from '@waldur/permissions/enums';
import { checkScope } from '@waldur/permissions/hasPermission';
import { ActionButton } from '@waldur/table/ActionButton';
import { getCustomer, getProject, getUser } from '@waldur/workspace/selectors';

import { InvitationContext } from '../types';

const InvitationCreateDialog = lazyComponent(
  () => import('./InvitationCreateDialog'),
  'InvitationCreateDialog',
);

export const InvitationCreateButton: FunctionComponent<
  Omit<InvitationContext, 'customer' | 'user'>
> = (context) => {
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);
  const project = useSelector(getProject);
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(InvitationCreateDialog, {
        size: 'xl',
        resolve: { ...context, user, customer },
      }),
    );

  const canInvite = useMemo(
    () =>
      context.roleTypes.some((roleType) => {
        let scope: any = context.scope;
        if (!scope) {
          switch (roleType) {
            case 'customer':
              scope = customer;
              break;
            case 'project':
              scope = context.project || project;
              break;

            default:
              break;
          }
        }
        return (
          checkScope(user, roleType, scope?.uuid, PermissionMap[roleType]) ||
          checkScope(user, 'customer', customer.uuid, PermissionMap[roleType])
        );
      }),
    [context, user, customer, project],
  );

  return (
    <ActionButton
      action={callback}
      title={translate('Invite user')}
      iconNode={<PlusCircle />}
      variant="primary"
      disabled={!canInvite}
    />
  );
};
