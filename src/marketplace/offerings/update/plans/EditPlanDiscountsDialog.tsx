import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { marketplacePlansUpdateDiscounts } from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { Plan } from '@/marketplace/types';
import { useModal } from '@/modal/hooks';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/hooks';

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
    const { showErrorResponse, showSuccess } = useNotify();
    const { closeDialog } = useModal();

    const update = async (formData) => {
      try {
        await marketplacePlansUpdateDiscounts({
          path: { uuid: props.resolve.plan.uuid },
          body: {
            discounts: formData.discounts,
          },
        });
        showSuccess(translate('Discounts have been updated successfully.'));
        await props.resolve.refetch();
        closeDialog();
      } catch (error) {
        showErrorResponse(error, translate('Unable to update discounts.'));
      }
    };

    return (
      <form onSubmit={props.handleSubmit(update)}>
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
