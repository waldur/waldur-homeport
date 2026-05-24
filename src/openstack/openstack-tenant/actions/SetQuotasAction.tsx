import { SlidersIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { User } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';
import { useUser } from '@/workspace/hooks';

import { TenantActionProps } from './types';
import { tenantQuotasStateValidator } from './utils';

const SetQuotasDialog = lazyComponent(() =>
  import('./SetQuotasDialog').then((module) => ({
    default: module.SetQuotasDialog,
  })),
);

const validators = [tenantQuotasStateValidator];

export const SetQuotasAction: FC<TenantActionProps> = ({
  resource,
  refetch,
}) => {
  const user = useUser();

  if (
    !hasPermission(user as User, {
      permission: PermissionEnum.MANAGE_OFFERING_BACKEND_RESOURCES,
      customerId: (resource as any).provider_uuid,
    })
  ) {
    return null;
  }

  return (
    <DialogActionItem
      validators={validators}
      title={translate('Change quotas')}
      modalComponent={SetQuotasDialog}
      resource={resource}
      extraResolve={{ refetch }}
      iconNode={<SlidersIcon weight="bold" />}
      dialogSize="xl"
    />
  );
};
