import { EyeIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { ServiceProviderAccount } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const ProviderAccountDetailsDialog = lazyComponent(() =>
  import('./ProviderAccountDetailsDialog').then((m) => ({
    default: m.ProviderAccountDetailsDialog,
  })),
);

interface ProviderAccountDetailsButtonProps {
  row: ServiceProviderAccount;
  providerCustomerUuid: string;
}

export const ProviderAccountDetailsButton: FC<
  ProviderAccountDetailsButtonProps
> = ({ row, providerCustomerUuid }) => {
  const { openDialog } = useModal();
  const callback = () =>
    openDialog(ProviderAccountDetailsDialog, {
      resolve: { account: row, providerCustomerUuid },
      size: 'lg',
    });

  return (
    <ActionItem
      title={translate('Details')}
      action={callback}
      iconNode={<EyeIcon weight="bold" />}
    />
  );
};
