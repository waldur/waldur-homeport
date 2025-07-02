import { useDispatch } from 'react-redux';
import {
  invoiceItemsPartialUpdate,
  PatchedInvoiceItemUpdateRequest,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

export const InvoiceItemUpdateDialog = ({
  resolve: { resource, refreshInvoiceItems },
}) => {
  const dispatch = useDispatch();
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
      submitForm={async (formData: PatchedInvoiceItemUpdateRequest) => {
        try {
          await invoiceItemsPartialUpdate({
            path: { uuid: resource.uuid },
            body: formData,
          });
          dispatch(showSuccess(translate('Invoice item has been updated.')));
          await refreshInvoiceItems();
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(
            showErrorResponse(e, translate('Unable to update invoice item.')),
          );
        }
      }}
      initialValues={initialValues}
    />
  );
};
