import { Field } from 'react-final-form';

import { translate } from '@/i18n';
import { EthernetType } from '@/openstack/types';

import { FormField } from './FormField';

const IPv4_CIDR_PATTERN =
  /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}\/(3[0-2]|[12]?[0-9])$/;

const IPv6_CIDR_PATTERN =
  /^(?:(?:[a-fA-F\d]{1,4}:){7}(?:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){6}(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){5}(?::(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,2}|:)|(?:[a-fA-F\d]{1,4}:){4}(?:(?::[a-fA-F\d]{1,4}){0,1}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,3}|:)|(?:[a-fA-F\d]{1,4}:){3}(?:(?::[a-fA-F\d]{1,4}){0,2}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,4}|:)|(?:[a-fA-F\d]{1,4}:){2}(?:(?::[a-fA-F\d]{1,4}){0,3}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,5}|:)|(?:[a-fA-F\d]{1,4}:){1}(?:(?::[a-fA-F\d]{1,4}){0,4}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,6}|:)|(?::(?:(?::[a-fA-F\d]{1,4}){0,5}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,7}|:)))(?:%[0-9a-zA-Z]{1,})?\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;

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

export const CIDRField = ({
  name,
  ethertype,
  component = FormField,
}: {
  name: string;
  ethertype: EthernetType;
  component?: any;
}) => (
  <Field
    name={name}
    component={component}
    validate={ethertype === 'IPv4' ? validateIPv4CIDR : validateIPv6CIDR}
    placeholder={getCIDRPlaceholder(ethertype)}
  />
);
