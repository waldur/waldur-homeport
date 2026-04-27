import { EyeIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { OfferingUser } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
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
  const dispatch = useDispatch();
  const offeringUuid = offering?.uuid || row.offering_uuid;
  const callback = () =>
    dispatch(
      openModalDialog(OfferingUserDetailsDialog, {
        resolve: { offeringUser: row, offeringUuid },
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
