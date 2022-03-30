import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { FieldArray } from 'redux-form';

import { translate } from '@waldur/i18n';
import { IpAddressList } from '@waldur/openstack/openstack-tenant/IpAddressList';
import { StaticRoutesTable } from '@waldur/openstack/openstack-tenant/StaticRoutesTable';
import {
  createNameField,
  createDescriptionField,
} from '@waldur/resource/actions/base';

const HostRoutesField: FunctionComponent = () => (
  <>
    <Form.Group>
      <label>{translate('Host routes')}</label>
      <FieldArray name="host_routes" component={StaticRoutesTable} />
    </Form.Group>
  </>
);

const NameserversField: FunctionComponent = () => (
  <>
    <Form.Group>
      <label>{translate('DNS name servers')}</label>
      <FieldArray name="dns_nameservers" component={IpAddressList} />
    </Form.Group>
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
    name: 'host_routes',
    component: HostRoutesField,
  },
  {
    name: 'dns_nameservers',
    component: NameserversField,
  },
];
