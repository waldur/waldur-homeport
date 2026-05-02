import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { marketplacePlansUpdateDiscounts } from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { Plan } from '@/marketplace/types';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { EDIT_PLAN_DISCOUNTS_FORM_ID } from './constants';
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

export const EditPlanDiscountsDialog = connect<
  {},
  {},
  { resolve: { plan: Plan } }
>((_, ownProps) => ({
  initialValues: getInitialValues(ownProps.resolve.plan),
}))(
  reduxForm<{}, { resolve: { offering; plan; refetch } }>({
    form: EDIT_PLAN_DISCOUNTS_FORM_ID,
  })((props) => {
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
      <form
        onSubmit={props.handleSubmit((values) =>
          updateDiscountsMutation.mutateAsync(values),
        )}
      >
        <ModalDialog
          title={translate('Edit discounts for plan {planName}', {
            planName: props.resolve.plan.name,
          })}
          footer={
            <SubmitButton
              disabled={props.invalid}
              submitting={props.submitting}
              label={translate('Save')}
            />
          }
        >
          <DiscountsTable components={props.resolve.offering.components} />
        </ModalDialog>
      </form>
    );
  }),
);
