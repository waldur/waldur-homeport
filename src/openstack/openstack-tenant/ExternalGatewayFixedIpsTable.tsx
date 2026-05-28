import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Table } from 'react-bootstrap';
import { Field } from 'react-final-form';
import { AvailableExternalNetworkSubnet } from 'waldur-js-client';

import { composeValidators, required } from '@/core/validators';
import { FieldError, SelectField, StringField } from '@/form';
import { translate } from '@/i18n';
import { CompactActionButton } from '@/table/CompactActionButton';

import { validateIPv4 } from '../utils';

const FixedIpRow = ({ prefix, subnetOptions, onRemove }) => (
  <tr>
    <td>
      <Field
        name={`${prefix}.ip_address`}
        validate={composeValidators(required, validateIPv4)}
      >
        {({ input, meta }) => (
          <>
            <StringField input={input} />
            <FieldError error={meta.touched && meta.error} />
          </>
        )}
      </Field>
    </td>
    <td>
      <Field
        name={`${prefix}.subnet_id`}
        component={SelectField}
        options={subnetOptions}
        simpleValue
        isClearable
        placeholder={translate('Auto')}
      />
    </td>
    <td>
      <CompactActionButton
        title={translate('Remove')}
        action={onRemove}
        iconNode={<TrashIcon weight="bold" />}
        variant="text-secondary"
      />
    </td>
  </tr>
);

const AddButton = ({ onClick }) => (
  <CompactActionButton
    title={translate('Add fixed IP')}
    action={onClick}
    iconNode={<PlusIcon weight="bold" />}
    variant="text-secondary"
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
        <Table responsive bordered striped className="mt-3">
          <thead>
            <tr>
              <th>{translate('IP address')}</th>
              <th>{translate('Subnet')}</th>
              <th>{translate('Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((prefix, index) => (
              <FixedIpRow
                key={prefix}
                prefix={prefix}
                subnetOptions={subnetOptions}
                onRemove={() => fields.remove(index)}
              />
            ))}
          </tbody>
        </Table>
      )}
      <AddButton onClick={() => fields.push({})} />
    </>
  );
};
