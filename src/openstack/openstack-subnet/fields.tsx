import { FunctionComponent } from 'react';
import { FieldArray } from 'react-final-form-arrays';

import { FormField, FormLabel } from 'waldur-ui';

import { translate } from '@/i18n';
import { IpAddressList } from '@/openstack/openstack-tenant/IpAddressList';
import { StaticRoutesTable } from '@/openstack/openstack-tenant/StaticRoutesTable';
import {
  createNameField,
  createDescriptionField,
} from '@/resource/actions/base';

const HostRoutesField: FunctionComponent = () => (
  <FormField>
    <FormLabel>{translate('Host routes')}</FormLabel>
    <FieldArray name="host_routes" component={StaticRoutesTable} />
  </FormField>
);

const NameserversField: FunctionComponent = () => (
  <FormField>
    <FormLabel>{translate('DNS name servers')}</FormLabel>
    <FieldArray name="dns_nameservers" component={IpAddressList} />
  </FormField>
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
    name: 'host_routes',
    component: HostRoutesField,
  },
  {
    name: 'dns_nameservers',
    component: NameserversField,
  },
];
