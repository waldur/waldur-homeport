import { EyeIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { OfferingUser } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const OfferingUserDetailsDialog = lazyComponent(() =>
  import('./OfferingUserDetailsDialog').then((m) => ({
    default: m.OfferingUserDetailsDialog,
  })),
);

interface OfferingUserDetailsButtonProps {
  row: OfferingUser;
  offering?: { uuid: string };
}

export const OfferingUserDetailsButton: FC<OfferingUserDetailsButtonProps> = ({
  row,
  offering,
}) => {
  const { openDialog } = useModal();
  const offeringUuid = offering?.uuid || row.offering_uuid;
  const callback = () =>
    openDialog(OfferingUserDetailsDialog, {
      resolve: { offeringUser: row, offeringUuid },
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
