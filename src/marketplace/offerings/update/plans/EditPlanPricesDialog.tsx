import { useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { updatePlanPrices } from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { EDIT_PLAN_FORM_ID } from './constants';
import { PricesTable } from './PricesTable';

export const EditPlanPricesDialog = connect<{}, {}, { resolve: { plan } }>(
  (_, ownProps) => ({
    initialValues: {
      prices: ownProps.resolve.plan.prices,
      future_prices: ownProps.resolve.plan.future_prices,
      new_prices: ownProps.resolve.plan.has_resources
        ? ownProps.resolve.plan.future_prices
        : ownProps.resolve.plan.prices,
    },
  }),
)(
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
          <Modal.Title>{translate('Edit prices')}</Modal.Title>
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
