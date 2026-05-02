import { FC } from 'react';
import { openstackVolumesAttach, openstackVolumesList } from 'waldur-js-client';
import { OpenStackVolume } from 'waldur-js-client';

import { getAllPages } from '@/core/api';
import { formatFilesize } from '@/core/utils';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';

const getAttachableVolumes = (instanceId, query) =>
  getAllPages((page) =>
    openstackVolumesList({
      query: {
        page,
        name: query,
        attach_instance_uuid: instanceId,
        // @ts-ignore
        o: ['name'],
        runtime_state: 'available',
      },
    }),
  ).then((options) => ({
    options,
  }));

const getOptionLabel = (option: OpenStackVolume) =>
  `${option.name} (${formatFilesize(option.size)}, ${
    option.type_name || 'default type'
  })`;

export const AttachVolumeDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const mutation = useManagedMutation<any, any, { volume: { uuid: string } }>({
    mutationFn: (formData) =>
      openstackVolumesAttach({
        path: { uuid: formData.volume.uuid },
        body: { instance: resource.url },
      }),

    successMessage: translate('Attach has been scheduled.'),
    errorMessage: translate('Unable to attach volume.'),
    refetch: refetch,
  });

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
      submitForm={mutation.mutateAsync}
    />
  );
};
