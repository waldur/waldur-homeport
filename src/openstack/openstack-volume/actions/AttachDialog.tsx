import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import {
  openstackInstancesList,
  openstackVolumesAttach,
} from 'waldur-js-client';

import { getAllPages } from '@/core/api';
import { UI_STALE_TIME } from '@/core/constants';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';

export const AttachDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const mutation = useManagedMutation<any, any, { instance: string }>({
    mutationFn: (formData) =>
      openstackVolumesAttach({
        path: { uuid: resource.uuid },
        body: { instance: formData.instance },
      }),

    successMessage: translate('Volume has been attached to instance.'),
    errorMessage: translate('Unable to attach volume to instance.'),
    refetch: refetch,
  });

  const asyncState = useQuery({
    queryKey: ['attachableInstances', resource.uuid],
    queryFn: async () => {
      const instances = await getAllPages((page) =>
        openstackInstancesList({
          query: {
            page,
            attach_volume_uuid: resource.uuid,
            field: ['url', 'name'],
          },
        }),
      );
      return {
        instances: instances.map((choice) => ({
          value: choice.url,
          label: choice.name,
        })),
      };
    },
    staleTime: UI_STALE_TIME,
  });

  const fields = asyncState.data
    ? [
        {
          name: 'instance',
          label: translate('Instance'),
          type: 'select',
          required: true,
          options: asyncState.data.instances,
        },
      ]
    : [];

  return (
    <ResourceActionDialog
      dialogTitle={translate('Attach OpenStack Volume to Instance')}
      formFields={fields}
      submitForm={mutation.mutateAsync}
    />
  );
};
