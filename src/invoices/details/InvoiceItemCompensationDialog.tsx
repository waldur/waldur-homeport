import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

import { createInvoiceItemCompensation } from '../api';

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
          await createInvoiceItemCompensation(resource.uuid, formData);
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
