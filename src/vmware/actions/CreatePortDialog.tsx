import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { useDispatch } from 'react-redux';
import {
  vmwareNetworksList,
  vmwareVirtualMachineCreatePort,
} from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { UI_STALE_TIME } from '@/core/constants';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { createNameField } from '@/resource/actions/base';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';
import { showSuccess, showErrorResponse } from '@/store/notify';

export const CreatePortDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const dispatch = useDispatch();

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
      formFields={fields}
      submitForm={async (formData) => {
        try {
          await vmwareVirtualMachineCreatePort({
            path: { uuid: resource.uuid },
            body: {
              description: formData.name,
              network: formData.network.value,
            },
          });
          dispatch(showSuccess(translate('Port has been created.')));
          dispatch(closeModalDialog());
          if (refetch) {
            await refetch();
          }
        } catch (e) {
          dispatch(showErrorResponse(e, translate('Unable to create port.')));
        }
      }}
    />
  );
};
