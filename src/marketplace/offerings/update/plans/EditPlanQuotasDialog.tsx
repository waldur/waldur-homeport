import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import { marketplacePlansUpdateQuotas } from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { QuotasTable } from './QuotasTable';

export const EditPlanQuotasDialog: FC<{
  resolve: { plan; components; offering; refetch };
}> = (props) => {
  const initialValues = useMemo(
    () => ({
      quotas: props.resolve.components.reduce(
        (acc, item) => ({
          ...acc,
          [item.type]: props.resolve.plan.quotas[item.type],
        }),
        {},
      ),
    }),
    [props.resolve.components, props.resolve.plan.quotas],
  );

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
    <Form
      initialValues={initialValues}
      onSubmit={(values) => updateMutation.mutateAsync(values)}
      render={({ handleSubmit, invalid, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Edit quotas')}
            footer={
              <SubmitButton
                disabled={invalid}
                submitting={submitting || updateMutation.isPending}
                label={translate('Save')}
              />
            }
          >
            <QuotasTable components={props.resolve.components} />
          </ModalDialog>
        </form>
      )}
    />
  );
};
