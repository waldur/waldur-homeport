import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { createSubnet } from '@waldur/openstack/api';
import { getFields } from '@waldur/openstack/openstack-subnet/fields';
import { SUBNET_PRIVATE_CIDR_PATTERN } from '@waldur/openstack/utils';
import { validateState } from '@waldur/resource/actions/base';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { ResourceAction } from '@waldur/resource/actions/types';
import { showErrorResponse, showSuccess } from '@waldur/store/coreSaga';

import { InternalNetworkAllocationPool } from '../InternalNetworkAllocationPool';

export default function createAction({ resource }): ResourceAction {
  return {
    name: 'create_subnet',
    title: translate('Create subnet'),
    type: 'form',
    validators: [validateState('OK')],
    fields: [
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
    ],
    getInitialValues: () => ({
      enable_default_gateway: true,
      cidr: '192.168.42.0/24',
    }),
    component: ResourceActionDialog,
    useResolve: true,
    submitForm: async (dispatch, formData) => {
      try {
        await createSubnet(resource.uuid, formData);
        dispatch(showSuccess(translate('Subnet has been created.')));
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(showErrorResponse(e, translate('Unable to create subnet.')));
      }
    },
  };
}
