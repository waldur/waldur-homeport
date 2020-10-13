import * as React from 'react';
import { FieldArray } from 'redux-form';

import { translate } from '@waldur/i18n';
import { IpAddressList } from '@waldur/openstack/openstack-tenant/IpAddressList';
import { StaticRoutesTable } from '@waldur/openstack/openstack-tenant/StaticRoutesTable';
import {
  createNameField,
  createDescriptionField,
} from '@waldur/resource/actions/base';

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

export const getFields = () => [
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
];
