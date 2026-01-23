import { EyeIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { MarketplaceServiceProviderUser } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

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
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(ProviderUserDetailsDialog, {
        resolve: { user: row },
        size: 'lg',
      }),
    );

  return (
    <ActionItem
      title={translate('Details')}
      action={callback}
      iconNode={<EyeIcon weight="bold" />}
    />
  );
};
