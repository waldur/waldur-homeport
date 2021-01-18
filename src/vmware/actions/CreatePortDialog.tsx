import { useDispatch } from 'react-redux';
import { useAsync } from 'react-use';

import { getAll } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { createNameField } from '@waldur/resource/actions/base';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

import { createPort } from '../api';

export const CreatePortDialog = ({ resolve: { resource } }) => {
  const dispatch = useDispatch();

  const asyncState = useAsync(async () => {
    const params = {
      customer_pair_uuid: resource.customer_uuid,
      settings_uuid: resource.settings_uuid,
    };
    const networks = await getAll<any>('/vmware-networks/', { params });
    return {
      networks: networks.map((network) => ({
        value: network.url,
        display_name: network.name,
      })),
    };
  });

  const fields = asyncState.value
    ? [
        createNameField(),
        {
          name: 'network',
          label: translate('Network'),
          type: 'select',
          required: true,
          options: asyncState.value.networks,
        },
      ]
    : [];

  return (
    <ResourceActionDialog
      dialogTitle={translate('Create port')}
      fields={fields}
      submitForm={async (formData) => {
        try {
          await createPort(resource.uuid, {
            name: formData.name,
            network: formData.network.value,
          });
          dispatch(showSuccess(translate('Port has been created.')));
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(showErrorResponse(e, translate('Unable to create port.')));
        }
      }}
    />
  );
};
