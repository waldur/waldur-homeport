import { invoiceItemsCreateCompensation } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';

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

  const fields = [
    {
      name: 'offering_component_name',
      label: translate('Name'),
      required: true,
      type: 'string',
    },
  ];

  return (
    <ResourceActionDialog
      dialogTitle={translate('Create compensation for invoice item {name}', {
        name: resource.name,
      })}
      formFields={fields}
      submitForm={mutation.mutateAsync}
      initialValues={{
        offering_component_name: translate('Compensation for {name}', {
          name: resource.details.offering_component_name,
        }),
      }}
    />
  );
};
