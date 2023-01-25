import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { getAll } from '@waldur/core/api';
import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { attachVolume } from '@waldur/openstack/api';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@waldur/resource/actions/types';
import { Volume } from '@waldur/resource/types';
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

const getOptionLabel = (option: Volume) =>
  `${option.name} (${formatFilesize(option.size)}, ${
    option.type_name || 'default type'
  })`;

export const AttachVolumeDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const dispatch = useDispatch();
  return (
    <ResourceActionDialog
      dialogTitle={translate('Attach volume')}
      formFields={[
        {
          name: 'volume',
          label: translate('Volume'),
          type: 'async_select',
          loadOptions: (query) => getAttachableVolumes(resource.uuid, query),
          getOptionLabel,
        },
      ]}
      submitForm={async (formData) => {
        try {
          await attachVolume(formData.volume.uuid, resource.url);
          dispatch(showSuccess(translate('Attach has been scheduled.')));
          dispatch(closeModalDialog());
          if (refetch) {
            await refetch();
          }
        } catch (e) {
          dispatch(showErrorResponse(e, translate('Unable to attach volume.')));
        }
      }}
    />
  );
};
