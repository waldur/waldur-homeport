import { Form } from 'react-final-form';
import { invoiceItemsCreateCompensation } from 'waldur-js-client';

import { required } from '@/core/validators';
import { FormFooter, StringGroup } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';

export const InvoiceItemCompensationDialog = ({
  resolve: { resource, refreshInvoiceItems },
}) => {
  const mutation = useManagedMutation<
    any,
    any,
    { offering_component_name: string }
  >({
    mutationFn: (formData) =>
      invoiceItemsCreateCompensation({
        path: { uuid: resource.uuid },
        body: formData,
      }),
    successMessage: translate('Compensation has been created.'),
    errorMessage: translate('Unable to create compensation.'),
    refetch: refreshInvoiceItems,
  });

  return (
    <Form
      initialValues={{
        offering_component_name: translate('Compensation for {name}', {
          name: resource.details.offering_component_name,
        }),
      }}
      onSubmit={mutation.mutateAsync}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Create compensation for invoice item')}
            subtitle={
              <ScopeSubtitle
                label={translate('Invoice item')}
                name={resource.name}
              />
            }
            footer={<FormFooter />}
          >
            <StringGroup
              name="offering_component_name"
              label={translate('Name')}
              required={true}
              validate={required}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
