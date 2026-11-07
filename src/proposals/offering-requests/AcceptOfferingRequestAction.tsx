import { CheckIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { ProviderRequestedOffering } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const AcceptOfferingRequestDialog = lazyComponent(() =>
  import('./AcceptOfferingRequestDialog').then((module) => ({
    default: module.AcceptOfferingRequestDialog,
  })),
);

interface AcceptOfferingRequestActionProps {
  row: ProviderRequestedOffering;
  refetch: () => void;
}

export const AcceptOfferingRequestAction: FC<
  AcceptOfferingRequestActionProps
> = ({ row, refetch }) => {
  const { openDialog } = useModal();
  return (
    <ActionItem
      action={() =>
        openDialog(AcceptOfferingRequestDialog, {
          resolve: { row, refetch },
          size: 'lg',
        })
      }
      title={translate('Accept')}
      iconNode={<CheckIcon weight="bold" />}
    />
  );
};
