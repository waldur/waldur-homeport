import { useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { updatePlanPrices } from '@waldur/marketplace/common/api';
import { Plan } from '@waldur/marketplace/types';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { EDIT_PLAN_FORM_ID } from './constants';
import { PricesTable } from './PricesTable';

const getInitialValues = (plan: Plan) => ({
  prices: plan.prices,
  future_prices: plan.future_prices,
  new_prices:
    plan.resources_count > 0
      ? {
          ...plan.prices,
          ...plan.future_prices,
        }
      : plan.prices,
});

export const EditPlanPricesDialog = connect<
  {},
  {},
  { resolve: { plan: Plan } }
>((_, ownProps) => ({
  initialValues: getInitialValues(ownProps.resolve.plan),
}))(
  reduxForm<{}, { resolve: { offering; plan; refetch } }>({
    form: EDIT_PLAN_FORM_ID,
  })((props) => {
    const dispatch = useDispatch();
    const update = useCallback(
      async (formData) => {
        try {
          await updatePlanPrices(props.resolve.plan.uuid, {
            prices: formData.new_prices,
          });
          dispatch(
            showSuccess(translate('Prices have been updated successfully.')),
          );
          await props.resolve.refetch();
          dispatch(closeModalDialog());
        } catch (error) {
          dispatch(
            showErrorResponse(error, translate('Unable to update prices.')),
          );
        }
      },
      [dispatch],
    );

    return (
      <form onSubmit={props.handleSubmit(update)}>
        <Modal.Header>
          <Modal.Title>
            {props.resolve.plan.resources_count > 0
              ? translate('Edit prices for next month')
              : translate('Edit prices for current month')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PricesTable
            components={props.resolve.offering.components}
            plan={props.resolve.plan}
          />
        </Modal.Body>
        <Modal.Footer>
          <SubmitButton
            disabled={props.invalid}
            submitting={props.submitting}
            label={translate('Save')}
          />
        </Modal.Footer>
      </form>
    );
  }),
);
