import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { createNameField } from '@waldur/resource/actions/base';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

import { addInvoiceItem } from '../api';

export const AddInvoiceItemDialog = ({ resolve: { resource } }) => {
  const dispatch = useDispatch();
  return (
    <ResourceActionDialog
      dialogTitle={translate('Add invoice item')}
      fields={[
        createNameField(),
        {
          name: 'unit_price',
          type: 'integer',
          label: translate('Unit price'),
        },
        {
          name: 'quantity',
          type: 'integer',
          label: translate('Quantity'),
        },
        {
          name: 'article_code',
          type: 'string',
          label: translate('Article code'),
        },
      ]}
      submitForm={async (formData) => {
        try {
          await addInvoiceItem(resource.url, formData);
          dispatch(showSuccess(translate('Invoice item has been created.')));
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(
            showErrorResponse(e, translate('Unable to create invoice item.')),
          );
        }
      }}
    />
  );
};
