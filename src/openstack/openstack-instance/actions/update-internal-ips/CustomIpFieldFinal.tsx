import { useMemo, useState, useCallback } from 'react';
import { Field } from 'react-final-form';
import { OpenStackSubNetAllocationPool } from 'waldur-js-client';

import { FormField, FormLabel, FormText } from 'waldur-ui';

import { required } from '@/core/validators';
import { BaseStringField, FieldError } from '@/form';
import { Select } from '@/form/select';
import { translate } from '@/i18n';
import {
  getIPsInRange,
  isIPInRange,
} from '@/openstack/openstack-network/utils';

interface CustomIpFieldFinalProps {
  parentName: string;
  data: any;
  autoFocus?: boolean;
  hasAutoOption?: boolean;
}

export const CustomIpFieldFinal = ({
  parentName,
  data,
  autoFocus = false,
  hasAutoOption = false,
}: CustomIpFieldFinalProps) => {
  const options = useMemo(() => {
    const ipRanges = data?.subnet
      ?.allocation_pools as OpenStackSubNetAllocationPool[];
    const customIps = ipRanges?.length
      ? ipRanges.flatMap(({ start, end }) => getIPsInRange(start, end))
      : [];
    const opts = customIps
      .map((ip) => ({ label: ip, value: ip }))
      .concat({
        value: 'other',
        label: translate('Other (manual input)'),
      });
    if (hasAutoOption) {
      return [{ label: translate('Automatic'), value: false }].concat(opts);
    }
    return opts;
  }, [data?.subnet?.allocation_pools]);

  const isOutsideAllocationPool = useCallback(
    (value) =>
      options.some((opt) => opt.value === value)
        ? null
        : translate('IPs is outside the allocation pool'),
    [options],
  );

  const isOutsideRange = useCallback(
    (value) =>
      !value || isIPInRange(value, data?.subnet?.cidr)
        ? null
        : translate('IP is outside of subnet CIDR'),
    [data?.subnet?.cidr],
  );

  const [selected, setSelected] = useState<{ label; value }>(() =>
    data?.fixed_ip ? { label: data?.fixed_ip, value: data?.fixed_ip } : null,
  );

  return (
    <Field
      name={`${parentName}.fixed_ip`}
      validate={(value) => {
        if (selected?.value === false) return undefined;
        const req = required(value);
        if (req) return req;
        return isOutsideRange(value);
      }}
    >
      {({ input, meta }) => (
        <FormField>
          <FormLabel>{translate('Custom IP')}</FormLabel>
          <Select
            placeholder={translate('e.g. 192.168.42.16')}
            options={options}
            value={options.find((opt) => opt.value === selected?.value)}
            onChange={(opt) => {
              setSelected(opt);
              input.onChange(opt.value === 'other' ? '' : opt.value);
            }}
            onBlur={input.onBlur}
          />

          <BaseStringField
            aria-label={translate('Custom IP address')}
            placeholder={translate('Enter custom IP')}
            value={input?.value}
            onChange={input.onChange}
            hidden={selected?.value !== 'other'}
            containerClassName={selected?.value === 'other' ? 'mt-3' : 'hidden'}
            autoFocus={autoFocus}
          />

          {(meta.touched || meta.submitFailed) &&
            (meta.error ? (
              <FieldError error={meta.error} />
            ) : isOutsideAllocationPool(input.value) ? (
              <FormText variant="warning" as="div">
                {isOutsideAllocationPool(input.value)}
              </FormText>
            ) : null)}
        </FormField>
      )}
    </Field>
  );
};
