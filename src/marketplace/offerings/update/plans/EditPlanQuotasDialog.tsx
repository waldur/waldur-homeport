import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { marketplacePlansUpdateQuotas } from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

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
    const updateMutation = useManagedMutation<any, any, any>({
      mutationFn: (formData) =>
        marketplacePlansUpdateQuotas({
          path: { uuid: props.resolve.plan.uuid },
          body: {
            quotas: formData.quotas,
          },
        }),
      successMessage: translate('Quotas have been updated successfully.'),
      errorMessage: translate('Unable to update quotas.'),
      refetch: props.resolve.refetch,
    });

    return (
      <form
        onSubmit={props.handleSubmit((values) =>
          updateMutation.mutateAsync(values),
        )}
      >
        <ModalDialog
          title={translate('Edit quotas')}
          footer={
            <SubmitButton
              disabled={props.invalid}
              submitting={updateMutation.isPending}
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
