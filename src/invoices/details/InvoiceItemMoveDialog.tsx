import { useDispatch, useSelector } from 'react-redux';
import { useAsync } from 'react-use';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';
import { getCustomer } from '@waldur/workspace/selectors';

import { loadInvoices, moveInvoiceItem } from '../api';

const formatDate = (invoice) => `${invoice.year}-${invoice.month}`;

export const InvoiceItemMoveDialog = ({
  resolve: { invoice, resource, refreshInvoiceItems },
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
        .filter((currentInvoice) => currentInvoice.url !== invoice.url)
        .map((invoice) => ({
          label: formatDate(invoice),
          value: invoice,
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
      dialogTitle={translate('Move item {name} from invoice {origin}', {
        name: resource.name,
        origin: formatDate(invoice),
      })}
      formFields={fields}
      loading={asyncState.loading}
      error={asyncState.error}
      submitForm={async (formData) => {
        try {
          await moveInvoiceItem(resource.uuid, {
            invoice: formData.invoice.url,
          });
          dispatch(
            showSuccess(
              translate(
                'Item {item} has been moved from invoice {origin} to {target}.',
                {
                  item: resource.name,
                  origin: formatDate(invoice),
                  target: formatDate(formData.invoice),
                },
              ),
            ),
          );
          await refreshInvoiceItems();
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(
            showErrorResponse(
              e,
              translate(
                'Unable to move item {item} from invoice {origin} to {target}.',
                {
                  item: resource.name,
                  origin: formatDate(invoice),
                  target: formatDate(formData.invoice),
                },
              ),
            ),
          );
        }
      }}
    />
  );
};
