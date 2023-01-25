import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { useAsync } from 'react-use';

import { getAll } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { attachVolume } from '@waldur/openstack/api';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@waldur/resource/actions/types';
import { VirtualMachine } from '@waldur/resource/types';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

export const AttachDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const dispatch = useDispatch();

  const asyncState = useAsync(async () => {
    const params = {
      attach_volume_uuid: resource.uuid,
      field: ['url', 'name'],
    };
    const instances = await getAll<VirtualMachine>(
      '/openstacktenant-instances/',
      { params },
    );
    return {
      instances: instances.map((choice) => ({
        value: choice.url,
        label: choice.name,
      })),
    };
  });

  const fields = asyncState.value
    ? [
        {
          name: 'instance',
          label: translate('Instance'),
          type: 'select',
          required: true,
          options: asyncState.value.instances,
        },
      ]
    : [];

  return (
    <ResourceActionDialog
      dialogTitle={translate('Attach OpenStack Volume to Instance')}
      formFields={fields}
      submitForm={async (formData) => {
        try {
          await attachVolume(resource.uuid, formData.instance);
          dispatch(
            showSuccess(translate('Volume has been attached to instance.')),
          );
          dispatch(closeModalDialog());
          if (refetch) {
            await refetch();
          }
        } catch (e) {
          dispatch(
            showErrorResponse(
              e,
              translate('Unable to attach volume to instance.'),
            ),
          );
        }
      }}
    />
  );
};
