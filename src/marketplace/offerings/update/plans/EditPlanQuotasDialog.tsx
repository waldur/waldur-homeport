import { useCallback } from 'react';
import { connect, useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';
import { marketplacePlansUpdateQuotas } from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@/store/notify';

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
          await marketplacePlansUpdateQuotas({
            path: { uuid: props.resolve.plan.uuid },
            body: {
              quotas: formData.quotas,
            },
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
        <ModalDialog
          title={translate('Edit quotas')}
          footer={
            <SubmitButton
              disabled={props.invalid}
              submitting={props.submitting}
              label={translate('Save')}
            />
          }
        >
          <QuotasTable components={props.resolve.components} />
        </ModalDialog>
      </form>
    );
  }),
);
