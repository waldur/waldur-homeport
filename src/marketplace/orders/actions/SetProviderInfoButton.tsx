import { EnvelopeIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { OrderDetails } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const SetProviderInfoDialog = lazyComponent(() =>
  import('./SetProviderInfoDialog').then((module) => ({
    default: module.SetProviderInfoDialog,
  })),
);

interface SetProviderInfoButtonProps {
  row: OrderDetails;
  refetch?: () => void;
  as?: React.ComponentType;
}

export const SetProviderInfoButton: FunctionComponent<
  SetProviderInfoButtonProps
> = (props) => {
  const { openDialog: openModal } = useModal();

  const openDialog = () => {
    openModal(SetProviderInfoDialog, {
      resolve: {
        order: props.row,
        refetch: props.refetch,
      },
      size: 'lg',
    });
  };

  return (
    <ActionItem
      as={props.as}
      title={translate('Request info')}
      action={openDialog}
      iconNode={<EnvelopeIcon weight="bold" />}
      iconColor="info"
    />
  );
};
