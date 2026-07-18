import { ShieldCheckIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const OfferingAccessSubnetsAllowListDialog = lazyComponent(() =>
  import('../details/OfferingAccessSubnetsAllowListDialog').then((module) => ({
    default: module.OfferingAccessSubnetsAllowListDialog,
  })),
);

export const OfferingAccessSubnetsAllowListButton = ({
  offeringUuid,
}: {
  offeringUuid: string;
}) => {
  const { openDialog } = useModal();
  return (
    <ActionButton
      title={translate('Firewall allow-list')}
      action={() =>
        openDialog(OfferingAccessSubnetsAllowListDialog, {
          resolve: { offeringUuid },
          size: 'lg',
        })
      }
      iconNode={<ShieldCheckIcon weight="bold" />}
    />
  );
};
