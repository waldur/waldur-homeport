import { useDispatch } from 'react-redux';
import { useAsync } from 'react-use';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { getInstances } from '@waldur/openstack/api';
import { linkInstance } from '@waldur/rancher/api';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

export const LinkDialog = ({ resolve: { resource } }) => {
  const dispatch = useDispatch();

  const asyncState = useAsync(async () => {
    const instances = await getInstances({
      project_uuid: resource.project_uuid,
      o: 'name',
    });

    return {
      instances: instances.map((choice) => ({
        value: choice.url,
        display_name: choice.name,
      })),
    };
  });

  const fields = asyncState.value
    ? [
        {
          name: 'instance',
          type: 'select',
          required: true,
          label: translate('OpenStack instance'),
          options: asyncState.value.instances,
        },
      ]
    : [];

  return (
    <ResourceActionDialog
      dialogTitle={translate('Link OpenStack Instance')}
      fields={fields}
      submitForm={async (formData) => {
        try {
          await linkInstance(resource.uuid, formData);
          dispatch(showSuccess(translate('Instance has been linked.')));
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(showErrorResponse(e, translate('Unable to link instance.')));
        }
      }}
    />
  );
};
