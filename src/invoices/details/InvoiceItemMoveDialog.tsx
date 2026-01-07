import { useQuery } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { invoiceItemsMigrateTo, invoicesList } from 'waldur-js-client';

import { getAllPages } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';
import { getCustomer } from '@waldur/workspace/selectors';

const formatDate = (invoice) => `${invoice.year}-${invoice.month}`;

export const InvoiceItemMoveDialog = ({
  resolve: { invoice, resource, refreshInvoiceItems },
}) => {
  const dispatch = useDispatch();
  const customer = useSelector(getCustomer);

  const asyncState = useQuery({
    queryKey: ['invoicesForMove', customer?.url, invoice.url],
    queryFn: async () => {
      const invoices = await getAllPages((page) =>
        invoicesList({
          query: {
            page,
            customer: customer.url,
            field: ['url', 'number', 'year', 'month'],
          },
        }),
      );
      return {
        invoices: invoices
          .filter((currentInvoice) => currentInvoice.url !== invoice.url)
          .map((invoice) => ({
            label: formatDate(invoice),
            value: invoice,
          })),
      };
    },
    staleTime: 3 * 60 * 1000,
  });

  const fields = asyncState.data
    ? [
        {
          name: 'invoice',
          label: translate('Target invoice'),
          type: 'select',
          options: asyncState.data.invoices,
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
      loading={asyncState.isLoading}
      error={asyncState.error}
      submitForm={async (formData) => {
        try {
          await invoiceItemsMigrateTo({
            path: { uuid: resource.uuid },
            body: {
              invoice: formData.invoice.url,
            },
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
