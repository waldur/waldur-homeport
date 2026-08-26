import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import {
  vmwareNetworksList,
  vmwareVirtualMachineCreatePort,
} from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { UI_STALE_TIME } from '@/core/constants';
import { translate } from '@/i18n';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { createNameField } from '@/resource/actions/base';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';

export const CreatePortDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const mutation = useManagedMutation<
    any,
    any,
    { name: string; network: { value: string } }
  >({
    mutationFn: (formData) =>
      vmwareVirtualMachineCreatePort({
        path: { uuid: resource.uuid },
        body: {
          description: formData.name,
          network: formData.network.value,
        },
      }),

    successMessage: translate('Port has been created.'),
    errorMessage: translate('Unable to create port.'),
    refetch: refetch,
  });

  const asyncState = useQuery({
    queryKey: [
      'vmwareNetworks',
      resource.customer_uuid,
      resource.settings_uuid,
    ],
    queryFn: async () => {
      const networks = await getAllPages((page) =>
        vmwareNetworksList({
          query: {
            page,
            page_size: MAX_PAGE_SIZE,
            customer_pair_uuid: resource.customer_uuid,
            settings_uuid: resource.settings_uuid,
          },
        }),
      );
      return {
        networks: networks.map((network) => ({
          value: network.url,
          label: network.name,
        })),
      };
    },
    staleTime: UI_STALE_TIME,
  });

  const fields = asyncState.data
    ? [
        createNameField(),
        {
          name: 'network',
          label: translate('Network'),
          type: 'select',
          required: true,
          options: asyncState.data.networks,
        },
      ]
    : [];

  return (
    <ResourceActionDialog
      dialogTitle={translate('Create port')}
      dialogSubtitle={
        <ScopeSubtitle
          label={translate('Virtual machine name')}
          name={resource.name}
        />
      }
      formFields={fields}
      submitForm={mutation.mutateAsync}
    />
  );
};
