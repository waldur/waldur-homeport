import React from 'react';

import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';

import { getCheckoutSummaryComponent } from '../common/registry';
import { FormStepProps } from '../deploy/types';

import { OrderSummary } from './OrderSummary';

interface OrderSummaryDialogProps {
  offering: FormStepProps['offering'];
}

export const OrderSummaryDialog: React.FC<OrderSummaryDialogProps> = (
  props,
) => {
  const CheckoutSummaryComponent =
    getCheckoutSummaryComponent(props.offering.type) || OrderSummary;

  return (
    <ModalDialog
      title={translate('Summary')}
      subtitle={translate(
        'Review the details of your order, before confirming',
      )}
    >
      <CheckoutSummaryComponent offering={props.offering} onlyDetails />
    </ModalDialog>
  );
};
