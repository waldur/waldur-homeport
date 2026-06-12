import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import {
  InstanceFlavorChangeRequest,
  openstackFlavorsList,
  openstackInstancesChangeFlavor,
} from 'waldur-js-client';

import { getAllPages } from '@/core/api';
import { UI_STALE_TIME } from '@/core/constants';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';
import { formatFlavor } from '@/resource/utils';

import { OpenStackInstanceCurrentFlavor } from '../OpenStackInstanceCurrentFlavor';

export const ChangeFlavorDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const mutation = useManagedMutation<any, any, InstanceFlavorChangeRequest>({
    mutationFn: (formData) =>
      openstackInstancesChangeFlavor({
        path: { uuid: resource.uuid },
        body: formData,
      }),

    successMessage: translate('Flavor change has been scheduled.'),
    errorMessage: translate('Unable to change flavor.'),
    refetch: refetch,
  });

  const asyncState = useQuery({
    queryKey: ['flavors', resource.tenant_uuid, resource.flavor_name],
    queryFn: async () => {
      const flavors = await getAllPages((page) =>
        openstackFlavorsList({
          query: {
            page,
            tenant_uuid: resource.tenant_uuid,
            field: ['url', 'name', 'cores', 'ram'],
          },
        }),
      );
      return {
        flavors: flavors
          .filter((flavor) => flavor.name !== resource.flavor_name)
          .map((flavor) => ({
            label: `${flavor.name} (${formatFlavor(flavor)})`,
            value: flavor.url,
          })),
      };
    },
    staleTime: UI_STALE_TIME,
  });

  const fields = asyncState.data
    ? [
        {
          name: 'currentFlavor',
          component: () => (
            <OpenStackInstanceCurrentFlavor context={{ resource }} />
          ),
        },
        {
          name: 'flavor',
          type: 'select',
          label: translate('New flavor'),
          options: asyncState.data.flavors,
        },
      ]
    : [];

  return (
    <ResourceActionDialog
      dialogTitle={translate('Change flavor')}
      loading={asyncState.isLoading}
      error={asyncState.error}
      formFields={fields}
      submitForm={mutation.mutateAsync}
    />
  );
};
