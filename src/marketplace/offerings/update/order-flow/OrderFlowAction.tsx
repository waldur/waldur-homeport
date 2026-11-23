import { FlowArrowIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

import type { OrderFlowOffering } from './types';

const OrderFlowDialog = lazyComponent(() =>
  import('./OrderFlowDialog').then((module) => ({
    default: module.OrderFlowDialog,
  })),
);

/** Opens the drawing of how orders for the offering move. */
export const OrderFlowAction: FC<{ offering: OrderFlowOffering }> = ({
  offering,
}) => {
  const { openDialog } = useModal();
  return (
    <ActionItem
      title={translate('Show order flow')}
      iconNode={<FlowArrowIcon weight="bold" />}
      action={() =>
        openDialog(OrderFlowDialog, { size: 'xl', resolve: { offering } })
      }
      data-testid="show-order-flow"
    />
  );
};
