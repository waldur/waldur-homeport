import { ShieldCheckIcon } from '@phosphor-icons/react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

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
    <BaseButton
      label={translate('Firewall allow-list')}
      onClick={() =>
        openDialog(OfferingAccessSubnetsAllowListDialog, {
          resolve: { offeringUuid },
          size: 'lg',
        })
      }
      iconNode={<ShieldCheckIcon weight="bold" />}
      variant="tertiary"
      size="lg"
    />
  );
};
