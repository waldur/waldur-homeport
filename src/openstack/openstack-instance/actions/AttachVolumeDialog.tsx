import { useDispatch } from 'react-redux';

import { getAll } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { attachVolume } from '@waldur/openstack/api';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

const getAttachableVolumes = (instanceId, query) =>
  getAll('/openstacktenant-volumes/', {
    params: {
      name: query,
      attach_instance_uuid: instanceId,
      o: 'name',
      runtime_state: 'available',
    },
  }).then((options) => ({
    options,
  }));

export const AttachVolumeDialog = ({ resolve: { resource } }) => {
  const dispatch = useDispatch();
  return (
    <ResourceActionDialog
      dialogTitle={translate('Attach volume')}
      fields={[
        {
          name: 'volume',
          label: translate('Volume'),
          type: 'async_select',
          loadOptions: (query) => getAttachableVolumes(resource.uuid, query),
        },
      ]}
      submitForm={async (formData) => {
        try {
          await attachVolume(formData.volume.uuid, resource.url);
          dispatch(showSuccess(translate('Attach has been scheduled.')));
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(showErrorResponse(e, translate('Unable to attach volume.')));
        }
      }}
    />
  );
};
