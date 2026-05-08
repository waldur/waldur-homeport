import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import { marketplacePlansUpdateDiscounts } from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { Offering, Plan } from '@/marketplace/types';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { DiscountsTable } from './DiscountsTable';

const getInitialValues = (plan: Plan) => {
  const initialDiscounts = {};
  if (plan.components) {
    for (const planComponent of plan.components) {
      initialDiscounts[planComponent.type] = {
        discount_threshold: planComponent.discount_threshold,
        discount_rate: planComponent.discount_rate,
      };
    }
  }
  return { discounts: initialDiscounts };
};

interface EditPlanDiscountsDialogProps {
  resolve: {
    offering: Offering;
    plan: Plan;
    refetch?: () => void;
  };
}

export const EditPlanDiscountsDialog: FC<EditPlanDiscountsDialogProps> = (
  props,
) => {
  const initialValues = useMemo(
    () => getInitialValues(props.resolve.plan),
    [props.resolve.plan],
  );

  const updateDiscountsMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) =>
      marketplacePlansUpdateDiscounts({
        path: { uuid: props.resolve.plan.uuid },
        body: {
          discounts: formData.discounts,
        },
      }),
    successMessage: translate('Discounts have been updated successfully.'),
    errorMessage: translate('Unable to update discounts.'),
    refetch: props.resolve.refetch,
  });

  return (
    <Form
      onSubmit={(values) => updateDiscountsMutation.mutateAsync(values)}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Edit discounts for plan {planName}', {
              planName: props.resolve.plan.name,
            })}
            footer={
              <SubmitButton
                disabled={invalid}
                submitting={submitting}
                label={translate('Save')}
              />
            }
          >
            <DiscountsTable components={props.resolve.offering.components} />
          </ModalDialog>
        </form>
      )}
    />
  );
};
