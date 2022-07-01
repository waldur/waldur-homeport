import { useDispatch, useSelector } from 'react-redux';
import { useAsync } from 'react-use';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';
import { getCustomer } from '@waldur/workspace/selectors';

import { loadInvoices, moveInvoiceItem } from '../api';

export const InvoiceItemMoveDialog = ({
  resolve: { resource, refreshInvoiceItems },
}) => {
  const dispatch = useDispatch();
  const customer = useSelector(getCustomer);

  const asyncState = useAsync(async () => {
    const invoices = await loadInvoices({
      params: {
        customer: customer.url,
        field: ['url', 'number', 'year', 'month'],
      },
    });
    return {
      invoices: invoices
        .filter((invoice) => invoice.url !== resource.url)
        .map((invoice) => ({
          label: `${invoice.year}-${invoice.month} (${invoice.number})`,
          value: invoice.url,
        })),
    };
  });

  const fields = asyncState.value
    ? [
        {
          name: 'invoice',
          label: translate('Target invoice'),
          type: 'select',
          options: asyncState.value.invoices,
        },
      ]
    : [];

  return (
    <ResourceActionDialog
      dialogTitle={translate('Move invoice item {name}', {
        name: resource.name,
      })}
      formFields={fields}
      loading={asyncState.loading}
      error={asyncState.error}
      submitForm={async (formData) => {
        try {
          await moveInvoiceItem(resource.uuid, formData);
          dispatch(showSuccess(translate('Invoice item has been moved.')));
          await refreshInvoiceItems();
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(
            showErrorResponse(e, translate('Unable to move invoice item.')),
          );
        }
      }}
    />
  );
};
