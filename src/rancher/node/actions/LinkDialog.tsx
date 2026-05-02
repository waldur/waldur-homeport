import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import {
  openstackInstancesList,
  rancherNodesLinkOpenstack,
} from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { UI_STALE_TIME } from '@/core/constants';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';

export const LinkDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const mutation = useManagedMutation<any, any, { instance: string }>({
    mutationFn: (formData) =>
      rancherNodesLinkOpenstack({
        path: { uuid: resource.uuid },
        body: formData,
      }),

    successMessage: translate('Instance has been linked.'),
    errorMessage: translate('Unable to link instance.'),
    refetch: refetch,
  });

  const asyncState = useQuery({
    queryKey: ['openstackInstancesForLink', resource.project_uuid],
    queryFn: async () => {
      const instances = await getAllPages((page) =>
        openstackInstancesList({
          query: {
            page,
            page_size: MAX_PAGE_SIZE,
            project_uuid: resource.project_uuid,
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
          type: 'select',
          required: true,
          label: translate('OpenStack instance'),
          options: asyncState.data.instances,
        },
      ]
    : [];

  return (
    <ResourceActionDialog
      dialogTitle={translate('Link OpenStack Instance')}
      formFields={fields}
      submitForm={mutation.mutateAsync}
    />
  );
};
