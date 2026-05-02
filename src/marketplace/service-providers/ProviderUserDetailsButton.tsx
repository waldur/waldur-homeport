import { EyeIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { MarketplaceServiceProviderUser } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const ProviderUserDetailsDialog = lazyComponent(() =>
  import('./ProviderUserDetailsDialog').then((m) => ({
    default: m.ProviderUserDetailsDialog,
  })),
);

interface ProviderUserDetailsButtonProps {
  row: MarketplaceServiceProviderUser;
}

export const ProviderUserDetailsButton: FC<ProviderUserDetailsButtonProps> = ({
  row,
}) => {
  const { openDialog } = useModal();
  const callback = () =>
    openDialog(ProviderUserDetailsDialog, {
      resolve: { user: row },
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
