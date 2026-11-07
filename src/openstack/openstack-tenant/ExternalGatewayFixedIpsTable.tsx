import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Field } from 'react-final-form';
import { AvailableExternalNetworkSubnet } from 'waldur-js-client';

import {
  BaseButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { composeValidators, required } from '@/core/validators';
import { FieldError, SelectField, StringField } from '@/form';
import { translate } from '@/i18n';

import { validateIPv4 } from '../utils';

const FixedIpRow = ({ prefix, subnetOptions, onRemove }) => (
  <TableRow>
    <TableCell>
      <Field
        name={`${prefix}.ip_address`}
        validate={composeValidators(required, validateIPv4)}
      >
        {({ input, meta }) => (
          <>
            <StringField input={input} meta={meta} />
            <FieldError error={meta.touched && meta.error} />
          </>
        )}
      </Field>
    </TableCell>
    <TableCell>
      <Field name={`${prefix}.subnet_id`}>
        {({ input, meta }) => (
          <SelectField
            input={input}
            meta={meta}
            options={subnetOptions}
            simpleValue
            isClearable
            placeholder={translate('Auto')}
          />
        )}
      </Field>
    </TableCell>
    <TableCell>
      <BaseButton
        label={translate('Remove')}
        onClick={onRemove}
        iconNode={<TrashIcon weight="bold" />}
        variant="text-secondary"
        size="sm"
      />
    </TableCell>
  </TableRow>
);

const AddButton = ({ onClick }) => (
  <BaseButton
    label={translate('Add fixed IP')}
    onClick={onClick}
    iconNode={<PlusIcon weight="bold" />}
    variant="text-secondary"
    size="sm"
  />
);

export const ExternalGatewayFixedIpsTable: FC<{
  fields;
  subnets?: AvailableExternalNetworkSubnet[];
}> = ({ fields, subnets = [] }) => {
  const subnetOptions = subnets.map((subnet) => ({
    value: subnet.backend_id,
    label: subnet.cidr ? `${subnet.name} (${subnet.cidr})` : subnet.name,
  }));

  return (
    <>
      {fields.length > 0 && (
        <Table density="compact" className="mt-2.5">
          <TableHeader>
            <TableRow>
              <TableHead>{translate('IP address')}</TableHead>
              <TableHead>{translate('Subnet')}</TableHead>
              <TableHead>{translate('Actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((prefix, index) => (
              <FixedIpRow
                key={prefix}
                prefix={prefix}
                subnetOptions={subnetOptions}
                onRemove={() => fields.remove(index)}
              />
            ))}
          </TableBody>
        </Table>
      )}
      <AddButton onClick={() => fields.push({})} />
    </>
  );
};
