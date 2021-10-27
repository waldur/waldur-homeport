import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

import { updateInvoiceItem } from '../api';

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
      name: 'quantity',
      label: translate('Quantity'),
      required: false,
      type: 'integer',
    },
  ];
  return (
    <ResourceActionDialog
      dialogTitle={translate('Update invoice item {name}', {
        name: resource.name,
      })}
      fields={fields}
      submitForm={async (formData) => {
        try {
          await updateInvoiceItem(resource.uuid, formData);
          dispatch(showSuccess(translate('Invoice item has been updated.')));
          await refreshInvoiceItems();
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(
            showErrorResponse(e, translate('Unable to update invoice item.')),
          );
        }
      }}
      initialValues={{
        article_code: resource.article_code,
      }}
    />
  );
};
