import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { openstackNetworksCreateSubnet } from 'waldur-js-client';

import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { InternalNetworkAllocationPool } from '@/openstack/openstack-subnet/AllocationPoolsField';
import { getFields } from '@/openstack/openstack-subnet/fields';
import { networkAutocomplete } from '@/openstack/openstack-subnet/networkAutocomplete';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';
import { showSuccess, showErrorResponse } from '@/store/notify';

type CreateSubnetDialogResolve = {
  resource: any;
  refetch?: () => void;
  showNetworkField?: boolean;
};

export const CreateSubnetDialog: FC<
  Omit<ActionDialogProps, 'resolve'> & { resolve: CreateSubnetDialogResolve }
> = ({ resolve: { resource, refetch, showNetworkField = false } }) => {
  const dispatch = useDispatch();
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
          name: 'allocation_pool',
          component: InternalNetworkAllocationPool,
        },
      ]}
      initialValues={{
        cidr: initialCidr,
        allocation_pools: [defaultPool],
      }}
      submitForm={async (formData) => {
        try {
          const networkUuid = showNetworkField
            ? formData.network?.uuid
            : resource.uuid;

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { network, ...submitData } = formData;

          await openstackNetworksCreateSubnet({
            path: { uuid: networkUuid },
            body: submitData,
          });
          dispatch(showSuccess(translate('Subnet has been created.')));
          dispatch(closeModalDialog());
          if (refetch) {
            await refetch();
          }
        } catch (e) {
          dispatch(showErrorResponse(e, translate('Unable to create subnet.')));
        }
      }}
    />
  );
};
