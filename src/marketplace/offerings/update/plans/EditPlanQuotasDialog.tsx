import { useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { updatePlanQuotas } from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { EDIT_PLAN_FORM_ID } from './constants';
import { QuotasTable } from './QuotasTable';

export const EditPlanQuotasDialog = connect<
  {},
  {},
  { resolve: { plan; components } }
>((_, ownProps) => ({
  initialValues: {
    quotas: ownProps.resolve.components.reduce(
      (acc, item) => ({
        ...acc,
        [item.type]: ownProps.resolve.plan.quotas[item.type],
      }),
      {},
    ),
  },
}))(
  reduxForm<{}, { resolve: { offering; plan; refetch; components } }>({
    form: EDIT_PLAN_FORM_ID,
  })((props) => {
    const dispatch = useDispatch();
    const update = useCallback(
      async (formData) => {
        try {
          await updatePlanQuotas(props.resolve.plan.uuid, {
            quotas: formData.quotas,
          });
          dispatch(
            showSuccess(translate('Quotas have been updated successfully.')),
          );
          await props.resolve.refetch();
          dispatch(closeModalDialog());
        } catch (error) {
          dispatch(
            showErrorResponse(error, translate('Unable to update quotas.')),
          );
        }
      },
      [dispatch],
    );

    return (
      <form onSubmit={props.handleSubmit(update)}>
        <Modal.Header>
          <Modal.Title>{translate('Edit quotas')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <QuotasTable components={props.resolve.components} />
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
