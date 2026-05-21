import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { FieldArray } from 'react-final-form-arrays';

import { translate } from '@/i18n';
import { IpAddressList } from '@/openstack/openstack-tenant/IpAddressList';
import { StaticRoutesTable } from '@/openstack/openstack-tenant/StaticRoutesTable';
import {
  createNameField,
  createDescriptionField,
} from '@/resource/actions/base';

const HostRoutesField: FunctionComponent = () => (
  <Form.Group>
    <Form.Label>{translate('Host routes')}</Form.Label>
    <FieldArray name="host_routes" component={StaticRoutesTable} />
  </Form.Group>
);

const NameserversField: FunctionComponent = () => (
  <Form.Group>
    <Form.Label>{translate('DNS name servers')}</Form.Label>
    <FieldArray name="dns_nameservers" component={IpAddressList} />
  </Form.Group>
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
