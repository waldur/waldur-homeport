import { useDispatch } from 'react-redux';
import { invoiceItemsCreateCompensation } from 'waldur-js-client';

import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { showSuccess, showErrorResponse } from '@/store/notify';

export const InvoiceItemCompensationDialog = ({
  resolve: { resource, refreshInvoiceItems },
}) => {
  const dispatch = useDispatch();
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
      submitForm={async (formData) => {
        try {
          await invoiceItemsCreateCompensation({
            path: { uuid: resource.uuid },
            body: formData,
          });
          dispatch(showSuccess(translate('Compensation has been created.')));
          await refreshInvoiceItems();
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(
            showErrorResponse(e, translate('Unable to create compensation.')),
          );
        }
      }}
      initialValues={{
        offering_component_name: translate('Compensation for {name}', {
          name: resource.details.offering_component_name,
        }),
      }}
    />
  );
};
