import { RobotIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { isFeatureVisible } from '@waldur/features/connect';
import { InvitationsFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

import { hasManageServiceAccountPermission } from '../team/utils';

import { ServiceAccountsProps } from './type';

const ServiceAccountFormDialog = lazyComponent(() =>
  import('./ServiceAccountFormDialog').then((module) => ({
    default: module.ServiceAccountFormDialog,
  })),
);

export const ServiceAccountCreateButton: FC<
  ServiceAccountsProps & {
    refetch(): void;
    disabled?: boolean;
    tooltip?: string;
  }
> = ({ context, scope, refetch, disabled, tooltip }) => {
  const canManageServiceAccount = useSelector(
    hasManageServiceAccountPermission(context, scope),
  );
  const showServiceAccounts =
    isFeatureVisible(InvitationsFeatures.show_service_accounts) &&
    canManageServiceAccount;

  if (!showServiceAccounts) {
    return null;
  }
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(ServiceAccountFormDialog, {
        resolve: { context, scope, refetch },
      }),
    );

  return (
    <ActionItem
      title={translate('Service account')}
      action={callback}
      iconNode={<RobotIcon weight="bold" />}
      disabled={disabled}
      tooltip={tooltip}
    />
  );
};
