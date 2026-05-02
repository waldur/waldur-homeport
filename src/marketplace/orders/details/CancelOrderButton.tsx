import { ProhibitIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { marketplaceOrdersCancel } from 'waldur-js-client';

import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

interface CancelOrderButtonProps {
  uuid: string;
  loadData(): void;
}

export const CancelOrderButton: FC<CancelOrderButtonProps> = (props) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () => marketplaceOrdersCancel({ path: { uuid: props.uuid } }),
    successMessage: translate('Order has been canceled.'),
    errorMessage: translate('Unable to cancel order.'),
    onSuccess: props.loadData,
  });

  return (
    <>
      {isPending ? (
        <LoadingSpinnerSimple className="me-1" />
      ) : (
        <ActionItem
          className="text-danger"
          title={translate('Cancel')}
          action={mutate}
          disabled={isPending}
          iconNode={<ProhibitIcon weight="bold" />}
          iconColor="danger"
        />
      )}
    </>
  );
};
