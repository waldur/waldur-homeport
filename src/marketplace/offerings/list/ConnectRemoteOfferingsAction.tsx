import { PlusIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const RemoteOfferingImportDialog = lazyComponent(() =>
  import('../import/RemoteOfferingImportDialog').then((module) => ({
    default: module.RemoteOfferingImportDialog,
  })),
);

interface ConnectRemoteOfferingsActionProps {
  refetch(): void;
}

export const ConnectRemoteOfferingsAction: FC<
  ConnectRemoteOfferingsActionProps
> = ({ refetch }) => {
  const { openDialog } = useModal();
  return (
    <ActionItem
      title={translate('Connect remote offerings')}
      action={() => {
        openDialog(RemoteOfferingImportDialog, {
          refetch,
          size: 'lg',
        });
      }}
      iconNode={<PlusIcon weight="bold" />}
    />
  );
};
