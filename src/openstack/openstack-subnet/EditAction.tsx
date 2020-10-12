import * as React from 'react';
import { FieldArray } from 'redux-form';

import { translate } from '@waldur/i18n';
import { updateSubnet } from '@waldur/openstack/api';
import {
  createNameField,
  createDescriptionField,
  createEditAction,
  validateState,
} from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

import { IpAddressList } from '../openstack-tenant/IpAddressList';
import { StaticRoutesTable } from '../openstack-tenant/StaticRoutesTable';

const HostRoutesField = () => (
  <>
    <div className="form-group">
      <label>{translate('Host routes')}</label>
      <FieldArray name="host_routes" component={StaticRoutesTable} />
    </div>
  </>
);

const NameserversField = () => (
  <>
    <div className="form-group">
      <label>{translate('DNS name servers')}</label>
      <FieldArray name="dns_nameservers" component={IpAddressList} />
    </div>
  </>
);

export default function createAction({ resource }): ResourceAction {
  return createEditAction({
    resource,
    fields: [
      createNameField(),
      createDescriptionField(),
      {
        name: 'gateway_ip',
        type: 'string',
        label: translate('Gateway IP of this subnet'),
      },
      {
        name: 'disable_gateway',
        type: 'boolean',
        label: translate('Disable gateway IP advertising via DHCP'),
      },
      {
        name: 'enable_default_gateway',
        type: 'boolean',
        label: translate('Connect subnet to a default virtual router'),
      },
      {
        name: 'host_routes',
        component: HostRoutesField,
      },
      {
        name: 'dns_nameservers',
        component: NameserversField,
      },
    ],
    validators: [validateState('OK')],
    updateResource: updateSubnet,
    verboseName: translate('OpenStack subnet'),
    getInitialValues: () => ({
      name: resource.name,
      description: resource.description,
      gateway_ip: resource.gateway_ip,
      disable_gateway: resource.disable_gateway,
      enable_default_gateway: resource.enable_default_gateway,
      host_routes: resource.host_routes,
      dns_nameservers: resource.dns_nameservers,
    }),
  });
}
