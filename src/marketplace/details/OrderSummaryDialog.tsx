import React from 'react';
import { Form } from 'react-final-form';

import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';

import { getCheckoutSummaryComponent } from '../common/registry';
import { DeployFormData } from '../common/types';
import { FormStepProps } from '../deploy/types';

import { OrderSummary } from './OrderSummary';

interface OrderSummaryDialogProps {
  offering: FormStepProps['offering'];
  formValues?: DeployFormData;
}

const noop = () => undefined;

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
      {/*
        Root cause: the summary tree is coupled to React Final Form — it reads
        the deploy form via useOrderFormData() -> useFormState() instead of
        receiving the order data as props. That works in the deploy sidebar but
        not here, where the dialog lives in a modal portal outside the <Form>
        provider. Until the summary is decoupled from the form, we re-provide a
        read-only form context seeded with the values snapshotted when the
        button was clicked (safe because this modal is read-only and blocks the
        underlying form, so the snapshot cannot go stale).
      */}
      <Form onSubmit={noop} initialValues={props.formValues}>
        {() => (
          <CheckoutSummaryComponent offering={props.offering} onlyDetails />
        )}
      </Form>
    </ModalDialog>
  );
};
