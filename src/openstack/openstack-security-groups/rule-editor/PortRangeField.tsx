import { FC } from 'react';
import { Field } from 'react-final-form';

import { translate } from '@/i18n';

import { FormField } from './FormField';
import { isNumericProtocol } from './ProtocolField';
import { Rule } from './types';

const isPortRangeDisabled = (protocol: string) =>
  !protocol || protocol === 'any' || isNumericProtocol(protocol);

const getPortMax = (rule: Rule) => {
  if (isPortRangeDisabled(rule.protocol)) {
    return -1;
  } else if (rule.protocol === 'icmp') {
    return 255;
  } else {
    return 65535;
  }
};

const parsePortRange = (value: any) => {
  if (!value || typeof value !== 'string') {
    return { min: -1, max: -1 };
  }
  const parts = value.split('-');
  const min = parseInt(parts[0], 10);
  const max = parseInt(parts[1], 10);
  if (parts.length === 2) {
    return { min, max };
  } else {
    return { min, max: min };
  }
};

const formatPortRange = (value: any) => {
  if (!value || typeof value !== 'object') return '';
  const { min, max } = value;
  if (min == null && max == null) {
    return '';
  }
  if (min === -1 && max === -1) {
    return '';
  }
  if (min === max && !isNaN(min)) {
    return min.toString();
  }
  if (isNaN(max)) {
    return `${min}-`;
  }
  return `${min}-${max}`;
};

interface PortRangeFieldProps {
  name: string;
  protocol: string;
  component?: any;
}

export const PortRangeField: FC<PortRangeFieldProps> = ({
  name,
  protocol,
  component = FormField,
}) => (
  <Field
    name={name}
    component={component}
    parse={parsePortRange}
    format={formatPortRange}
    disabled={isPortRangeDisabled(protocol)}
    placeholder={translate('All ports')}
    validate={(value) => {
      if (!value || (value.min === -1 && value.max === -1)) {
        return;
      }
      const { min, max } = value;
      const portMax = getPortMax({ protocol } as Rule);
      if (min > max) {
        return translate(
          'The minimum port number should not exceed the maximum port number.',
        );
      }
      if (min > portMax || max > portMax) {
        return translate(
          'Port number in the range should be at most {portMax}.',
          {
            portMax,
          },
        );
      }
      if (min != undefined && max != undefined && isNaN(max)) {
        return translate('The maximum port number is not specified.');
      }
    }}
  />
);
