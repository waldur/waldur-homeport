import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  marketplacePlansUpdateDiscounts,
  ProviderOfferingDetails as Offering,
  ProviderPlanDetails as Plan,
} from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { ActiveCallDiscountNotice } from './ActiveCallDiscountNotice';
import { DiscountsTable } from './DiscountsTable';

const getInitialValues = (plan: Plan) => {
  const initialDiscounts = {};
  if (plan.components) {
    for (const planComponent of plan.components) {
      initialDiscounts[planComponent.type] = {
        discount_formula: planComponent.discount_formula,
        discount_aggregation: planComponent.discount_aggregation || 'customer',
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

  // Only components that exist on this plan can have their discount saved (the
  // backend updates plan components), so render an editor for those only —
  // avoids showing a scope/formula for offering components the plan lacks.
  const components = useMemo(() => {
    const planTypes = new Set(
      (props.resolve.plan.components || []).map((pc) => pc.type),
    );
    return (props.resolve.offering.components || []).filter((component) =>
      planTypes.has(component.type),
    );
  }, [props.resolve.plan.components, props.resolve.offering.components]);

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
            <ActiveCallDiscountNotice
              offeringUuid={props.resolve.offering.uuid}
            />
            <DiscountsTable components={components} />
          </ModalDialog>
        </form>
      )}
    />
  );
};
