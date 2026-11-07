import { XIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { ProviderRequestedOffering } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const RejectOfferingRequestDialog = lazyComponent(() =>
  import('./RejectOfferingRequestDialog').then((module) => ({
    default: module.RejectOfferingRequestDialog,
  })),
);

interface RejectOfferingRequestActionProps {
  row: ProviderRequestedOffering;
  refetch: () => void;
}

export const RejectOfferingRequestAction: FC<
  RejectOfferingRequestActionProps
> = ({ row, refetch }) => {
  const { openDialog } = useModal();
  return (
    <ActionItem
      action={() =>
        openDialog(RejectOfferingRequestDialog, { resolve: { row, refetch } })
      }
      title={translate('Reject')}
      iconNode={<XIcon weight="bold" />}
      className="text-danger"
      iconColor="danger"
    />
  );
};
