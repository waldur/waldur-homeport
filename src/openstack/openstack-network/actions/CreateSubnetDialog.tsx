import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { createSubnet } from '@waldur/openstack/api';
import { getFields } from '@waldur/openstack/openstack-subnet/fields';
import { SUBNET_PRIVATE_CIDR_PATTERN } from '@waldur/openstack/utils';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

import { InternalNetworkAllocationPool } from '../InternalNetworkAllocationPool';

export const CreateSubnetDialog = ({ resolve: { resource } }) => {
  const dispatch = useDispatch();
  return (
    <ResourceActionDialog
      dialogTitle={translate('Create subnet')}
      fields={[
        ...getFields(),
        {
          name: 'disable_gateway',
          type: 'boolean',
          label: translate('Do not configure a gateway for this subnet'),
        },
        {
          name: 'cidr',
          label: translate('Internal network mask (CIDR)'),
          type: 'string',
          pattern: SUBNET_PRIVATE_CIDR_PATTERN,
        },
        {
          name: 'allocation_pool',
          component: InternalNetworkAllocationPool,
        },
      ]}
      initialValues={{
        enable_default_gateway: true,
        cidr: '192.168.42.0/24',
      }}
      submitForm={async (formData) => {
        try {
          await createSubnet(resource.uuid, formData);
          dispatch(showSuccess(translate('Subnet has been created.')));
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(showErrorResponse(e, translate('Unable to create subnet.')));
        }
      }}
    />
  );
};
