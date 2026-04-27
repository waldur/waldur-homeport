import React from 'react';
import { PublicOfferingDetails } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';

import { getCheckoutSummaryComponent } from '../common/registry';

import { OrderSummary } from './OrderSummary';

interface OrderSummaryDialogProps {
  offering: PublicOfferingDetails;
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
      closeButton
    >
      <CheckoutSummaryComponent offering={props.offering} onlyDetails />
    </ModalDialog>
  );
};
