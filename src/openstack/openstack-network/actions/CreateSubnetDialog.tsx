import { FC } from 'react';
import { openstackNetworksCreateSubnet } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { InternalNetworkAllocationPool } from '@/openstack/openstack-subnet/AllocationPoolsField';
import { getFields } from '@/openstack/openstack-subnet/fields';
import { networkAutocomplete } from '@/openstack/openstack-subnet/networkAutocomplete';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';

type CreateSubnetDialogResolve = {
  resource: any;
  refetch?: () => void;
  showNetworkField?: boolean;
};

type CreateSubnetFormData = {
  network?: { uuid: string };
  name: string;
  description?: string;
  cidr?: string;
  allocation_pools?: Array<{ start: string; end: string }>;
};

export const CreateSubnetDialog: FC<
  Omit<ActionDialogProps, 'resolve'> & { resolve: CreateSubnetDialogResolve }
> = ({ resolve: { resource, refetch, showNetworkField = false } }) => {
  const mutation = useManagedMutation<any, any, CreateSubnetFormData>({
    mutationFn: (formData) => {
      const networkUuid = showNetworkField
        ? formData.network?.uuid
        : resource.uuid;
      const { network: _network, ...submitData } = formData;

      return openstackNetworksCreateSubnet({
        path: { uuid: networkUuid },
        body: submitData,
      });
    },
    successMessage: translate('Subnet has been created.'),
    errorMessage: translate('Unable to create subnet.'),
    refetch,
  });

  const initialCidr = '192.168.42.0/24';
  const defaultPool = {
    start: '192.168.42.10',
    end: '192.168.42.200',
  };

  const networkField = showNetworkField
    ? [
        {
          name: 'network',
          label: translate('Network'),
          type: 'async_select',
          placeholder: translate('Select network...'),
          loadOptions: networkAutocomplete(resource.uuid),
          defaultOptions: true,
          getOptionValue: (option) => option.uuid,
          getOptionLabel: (option) => option.name,
          noOptionsMessage: () => translate('No networks'),
          isClearable: true,
          required: true,
        },
      ]
    : [];

  return (
    <ResourceActionDialog
      dialogTitle={translate('Create subnet')}
      formFields={[
        ...networkField,
        ...getFields(),
        {
          name: 'cidr',
          label: translate('Internal network mask (CIDR)'),
          type: 'string',
        },
        {
          name: 'allocation_pools',
          component: InternalNetworkAllocationPool,
        },
      ]}
      initialValues={{
        cidr: initialCidr,
        allocation_pools: [defaultPool],
      }}
      submitForm={mutation.mutateAsync}
    />
  );
};
