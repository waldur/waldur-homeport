import cidrRegex from 'cidr-regex';
import { FC } from 'react';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';

import { FormField } from './FormField';
import { Rule } from './types';

const IPv4_CIDR_PATTERN = cidrRegex.v4({ exact: true });

const IPv6_CIDR_PATTERN = cidrRegex.v6({ exact: true });

const validateIPv4CIDR = (value: string) => {
  if (value && !value.match(IPv4_CIDR_PATTERN)) {
    return translate('The value is not valid IP v4 CIDR');
  }
};

const validateIPv6CIDR = (value: string) => {
  if (value && !value.match(IPv6_CIDR_PATTERN)) {
    return translate('The value is not valid IP v6 CIDR');
  }
};

const getCIDRPlaceholder = (rule: Rule) => {
  if (rule.ethertype === 'IPv4') {
    return '0.0.0.0/0';
  } else if (rule.ethertype === 'IPv6') {
    return '::/0';
  }
};

interface Props {
  rule: Rule;
}

export const CIDRField: FC<Props> = ({ rule }) => (
  <Field
    name="cidr"
    component={FormField}
    validate={rule.ethertype === 'IPv4' ? validateIPv4CIDR : validateIPv6CIDR}
    placeholder={getCIDRPlaceholder(rule)}
  />
);
