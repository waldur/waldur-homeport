import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { createSubnet } from '@waldur/openstack/api';
import { getFields } from '@waldur/openstack/openstack-subnet/fields';
import { SUBNET_PRIVATE_CIDR_PATTERN } from '@waldur/openstack/utils';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@waldur/resource/actions/types';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

import { InternalNetworkAllocationPool } from '../InternalNetworkAllocationPool';

export const CreateSubnetDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const dispatch = useDispatch();
  return (
    <ResourceActionDialog
      dialogTitle={translate('Create subnet')}
      formFields={[
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
        cidr: '192.168.42.0/24',
      }}
      submitForm={async (formData) => {
        try {
          await createSubnet(resource.uuid, formData);
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
