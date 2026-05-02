import {
  invoiceItemsPartialUpdate,
  PatchedInvoiceItemUpdateRequest,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';

export const InvoiceItemUpdateDialog = ({
  resolve: { resource, refreshInvoiceItems },
}) => {
  const mutation = useManagedMutation<
    any,
    any,
    PatchedInvoiceItemUpdateRequest
  >({
    mutationFn: (formData) =>
      invoiceItemsPartialUpdate({
        path: { uuid: resource.uuid },
        body: formData,
      }),
    successMessage: translate('Invoice item has been updated.'),
    errorMessage: translate('Unable to update invoice item.'),
    refetch: refreshInvoiceItems,
  });

  const fields = [
    {
      name: 'article_code',
      label: translate('Article code'),
      required: false,
      type: 'string',
    },
    {
      name: 'unit_price',
      label: translate('Unit price'),
      required: false,
      type: 'integer',
    },
  ];

  if (resource.billing_type === 'fixed') {
    fields.push({
      name: 'start',
      label: translate('Date and time when item usage has started'),
      required: true,
      type: 'datetime',
    });
    fields.push({
      name: 'end',
      label: translate('Date and time when item usage has ended'),
      required: true,
      type: 'datetime',
    });
  } else {
    fields.push({
      name: 'quantity',
      label: translate('Quantity'),
      required: false,
      type: 'integer',
    });
  }
  const initialValues: PatchedInvoiceItemUpdateRequest = {
    article_code: resource.article_code,
    unit_price: resource.unit_price,
  };
  if (resource.billing_type === 'fixed') {
    initialValues.start = resource.start;
    initialValues.end = resource.end;
  } else {
    initialValues.quantity = resource.quantity;
  }
  return (
    <ResourceActionDialog
      dialogTitle={translate('Update invoice item {name}', {
        name: resource.name,
      })}
      formFields={fields}
      submitForm={mutation.mutateAsync}
      initialValues={initialValues}
    />
  );
};
