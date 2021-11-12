import { FC, useMemo } from 'react';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';

import { FormField } from './FormField';
import { Rule } from './types';
import { getPortMax } from './utils';

interface PortRangeFieldProps {
  rule: Rule;
}

const parsePortRange = (value: string) => {
  if (!value) {
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

const formatPortRange = (value) => {
  const { min, max } = value;
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

export const PortRangeField: FC<PortRangeFieldProps> = ({ rule }) => {
  const portMax = getPortMax(rule);
  const validate = useMemo(
    () => (value) => {
      if (!value) {
        return;
      }
      const { min, max } = value;
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
    },
    [portMax],
  );
  return (
    <>
      <Field
        name="port_range"
        component={FormField}
        validate={validate}
        parse={parsePortRange}
        format={formatPortRange}
        placeholder={translate('All ports')}
        tooltip={translate(
          'Enter a single port (22) or a port range (5000-6000) or just leave blank for all ports.',
        )}
      />
    </>
  );
};
