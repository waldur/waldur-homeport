import { RobotIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useSelector } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { isFeatureVisible } from '@/features/connect';
import { InvitationsFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

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
  const { openDialog } = useModal();
  const callback = () =>
    openDialog(ServiceAccountFormDialog, {
      resolve: { context, scope, refetch },
    });

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
