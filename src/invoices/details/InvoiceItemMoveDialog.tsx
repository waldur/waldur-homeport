import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { invoiceItemsMigrateTo, invoicesList } from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { UI_STALE_TIME } from '@/core/constants';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { useNotify } from '@/store/notify';
import { getCustomer } from '@/workspace/selectors';

const formatDate = (invoice) => `${invoice.year}-${invoice.month}`;

export const InvoiceItemMoveDialog = ({
  resolve: { invoice, resource, refreshInvoiceItems },
}) => {
  const { showSuccess, showErrorResponse } = useNotify();

  const mutation = useManagedMutation<any, any, { invoice: { url: string } }>({
    mutationFn: (formData) =>
      invoiceItemsMigrateTo({
        path: { uuid: resource.uuid },
        body: {
          invoice: formData.invoice.url,
        },
      }),
    onSuccess: (_data, formData) => {
      showSuccess(
        translate(
          'Item {item} has been moved from invoice {origin} to {target}.',
          {
            item: resource.name,
            origin: formatDate(invoice),
            target: formatDate(formData.invoice),
          },
        ),
      );
    },
    onError: (error, formData) => {
      showErrorResponse(
        error,
        translate(
          'Unable to move item {item} from invoice {origin} to {target}.',
          {
            item: resource.name,
            origin: formatDate(invoice),
            target: formatDate(formData.invoice),
          },
        ),
      );
    },
    refetch: refreshInvoiceItems,
  });

  const customer = useSelector(getCustomer);

  const asyncState = useQuery({
    queryKey: ['invoicesForMove', customer?.url, invoice.url],
    queryFn: async () => {
      const invoices = await getAllPages((page) =>
        invoicesList({
          query: {
            page,
            page_size: MAX_PAGE_SIZE,
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
    staleTime: UI_STALE_TIME,
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
      submitForm={mutation.mutateAsync}
    />
  );
};
