import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { resourceAutocomplete } from '@waldur/marketplace/common/autocompletes';
import { closeModalDialog } from '@waldur/modal/actions';
import { createNameField } from '@waldur/resource/actions/base';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

import { addInvoiceItem } from '../api';

export const AddInvoiceItemDialog = ({ resolve: { resource } }) => {
  const dispatch = useDispatch();
  const fields = [
    createNameField(),
    {
      name: 'resource',
      label: translate('Resource'),
      type: 'async_select',
      loadOptions: (query, prevOptions, page) =>
        resourceAutocomplete(
          { name: query, customer: resource.customer },
          prevOptions,
          page,
        ),
      getOptionLabel: ({ name }) => name,
      getOptionValue: ({ url }) => url,
      required: true,
    },
    {
      name: 'unit_price',
      type: 'integer',
      label: translate('Unit price'),
      required: true,
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
  ];
  return (
    <ResourceActionDialog
      dialogTitle={translate('Add invoice item')}
      fields={fields}
      submitForm={async (formData) => {
        try {
          await addInvoiceItem(resource.url, {
            ...formData,
            resource: formData.resource?.url,
          });
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
