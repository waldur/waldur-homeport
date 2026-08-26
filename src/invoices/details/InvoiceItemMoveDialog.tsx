import { useMemo } from 'react';
import { Form } from 'react-final-form';
import { Invoice, invoiceItemsMigrateTo, invoicesList } from 'waldur-js-client';

import { required } from '@/core/validators';
import { AsyncSelectGroup, FormFooter } from '@/form';
import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';
import { useCustomer } from '@/workspace/hooks';

const formatDate = (invoice) => `${invoice.year}-${invoice.month}`;

export const InvoiceItemMoveDialog = ({
  resolve: { invoice, resource, refreshInvoiceItems },
}) => {
  const { showSuccess, showErrorResponse } = useNotify();

  const mutation = useManagedMutation<any, any, { invoice: Invoice }>({
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

  const customer = useCustomer();

  const loadOptions = useMemo(
    () =>
      createLoadOptions(invoicesList, 'year', {
        customer: customer?.url,
        field: ['url', 'number', 'year', 'month'],
      }),
    [customer?.url],
  );

  return (
    <Form<{ invoice: Invoice }>
      onSubmit={async (values) => {
        try {
          await mutation.mutateAsync(values);
        } catch {
          // Handled by useManagedMutation
        }
      }}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Move item from invoice {origin}', {
              origin: formatDate(invoice),
            })}
            subtitle={
              <ScopeSubtitle
                label={translate('Invoice item')}
                name={resource.name}
              />
            }
            footer={<FormFooter />}
          >
            <AsyncSelectGroup
              name="invoice"
              label={translate('Target invoice')}
              placeholder={translate('Select invoice...')}
              loadOptions={loadOptions}
              defaultOptions={true}
              getOptionValue={(option) => option.url}
              getOptionLabel={(option) => formatDate(option)}
              isOptionDisabled={(option) => option.url === invoice.url}
              noOptionsMessage={() => translate('No invoices')}
              isClearable={false}
              required={true}
              validate={required}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
