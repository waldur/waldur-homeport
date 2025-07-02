import cidrRegex from 'cidr-regex';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { EthernetType } from '@waldur/openstack/types';

import { FormField } from './FormField';

const IPv4_CIDR_PATTERN = cidrRegex.v4({ exact: true });

const IPv6_CIDR_PATTERN = cidrRegex.v6({ exact: true });

export const validateIPv4CIDR = (value: string) => {
  if (value && !value.match(IPv4_CIDR_PATTERN)) {
    return translate('The value is not valid IP v4 CIDR');
  }
};

export const validateIPv6CIDR = (value: string) => {
  if (value && !value.match(IPv6_CIDR_PATTERN)) {
    return translate('The value is not valid IP v6 CIDR');
  }
};

export const getCIDRPlaceholder = (ethertype: EthernetType) => {
  if (ethertype === 'IPv4') {
    return '0.0.0.0/0';
  } else if (ethertype === 'IPv6') {
    return '::/0';
  }
};

export const CIDRField = ({ ethertype }: { ethertype: EthernetType }) => (
  <Field
    name="cidr"
    component={FormField}
    validate={ethertype === 'IPv4' ? validateIPv4CIDR : validateIPv6CIDR}
    placeholder={getCIDRPlaceholder(ethertype)}
  />
);
