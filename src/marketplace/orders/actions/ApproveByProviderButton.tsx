import { CheckCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { OrderDetails } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionButton } from '@/table/ActionButton';

const ApproveByProviderDialog = lazyComponent(() =>
  import('./ApproveByProviderDialog').then((module) => ({
    default: module.ApproveByProviderDialog,
  })),
);

interface SupportOrderApproveButtonProps {
  row: OrderDetails;
  refetch?: () => void;
  as?: React.ComponentType;
  size?: 'sm';
}

export const ApproveByProviderButton: FunctionComponent<
  SupportOrderApproveButtonProps
> = (props) => {
  const { openDialog } = useModal();

  const openApprovalDialog = () => {
    openDialog(ApproveByProviderDialog, {
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
      className={props.as === ActionButton ? 'w-100' : undefined}
      title={translate('Approve')}
      action={openApprovalDialog}
      variant="primary"
      iconNode={<CheckCircleIcon weight="bold" />}
    />
  );
};
