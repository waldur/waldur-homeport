import { Form } from 'react-final-form';
import {
  invoiceItemsPartialUpdate,
  PatchedInvoiceItemUpdateRequest,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { DateTimeGroup, FormFooter, NumberGroup, StringGroup } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';

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

  const isFixed = resource.billing_type === 'fixed';

  const initialValues: PatchedInvoiceItemUpdateRequest = {
    article_code: resource.article_code,
    unit_price: resource.unit_price,
  };

  if (isFixed) {
    initialValues.start = resource.start;
    initialValues.end = resource.end;
  } else {
    initialValues.quantity = resource.quantity;
  }

  return (
    <Form<PatchedInvoiceItemUpdateRequest>
      initialValues={initialValues}
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
            title={translate('Update invoice item')}
            subtitle={
              <ScopeSubtitle
                label={translate('Invoice item')}
                name={resource.name}
              />
            }
            footer={<FormFooter />}
          >
            <StringGroup
              name="article_code"
              label={translate('Article code')}
              required={false}
            />
            <NumberGroup
              name="unit_price"
              label={translate('Unit price')}
              required={false}
              type="number"
            />
            {isFixed ? (
              <>
                <DateTimeGroup
                  name="start"
                  label={translate('Date and time when item usage has started')}
                  required={true}
                  validate={required}
                />
                <DateTimeGroup
                  name="end"
                  label={translate('Date and time when item usage has ended')}
                  required={true}
                  validate={required}
                />
              </>
            ) : (
              <NumberGroup
                name="quantity"
                label={translate('Quantity')}
                required={false}
                type="number"
              />
            )}
          </ModalDialog>
        </form>
      )}
    />
  );
};
