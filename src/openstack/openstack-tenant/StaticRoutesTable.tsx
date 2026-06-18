import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { Table } from 'react-bootstrap';
import { Field } from 'react-final-form';
import { OpenStackFixedIp } from 'waldur-js-client';

import { required, composeValidators } from '@/core/validators';
import { StringField, FieldError } from '@/form';
import { translate } from '@/i18n';
import { CompactActionButton } from '@/table/CompactActionButton';

import { validateIPv4 } from '../utils';

const validateFixedIPs = (fixedIps: OpenStackFixedIp[]) => (value: string) => {
  if (fixedIps.some((ip) => ip.ip_address === value)) {
    return translate('IP address is already used by router.');
  }
};

const StaticRouteRow = ({ route, nexthopValidator, onRemove }) => (
  <tr>
    <td>
      <Field name={`${route}.destination`} validate={required}>
        {({ input, meta }) => (
          <>
            <StringField
              input={input}
              meta={meta}
              aria-label={translate('Destination (CIDR)')}
            />
            <FieldError error={meta.touched && meta.error} />
          </>
        )}
      </Field>
    </td>
    <td>
      <Field name={`${route}.nexthop`} validate={nexthopValidator}>
        {({ input, meta }) => (
          <>
            <StringField
              input={input}
              meta={meta}
              aria-label={translate('Next hop (IP)')}
            />
            <FieldError error={meta.touched && meta.error} />
          </>
        )}
      </Field>
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

const StaticRouteAddButton = ({ onClick }) => (
  <CompactActionButton
    title={translate('Add route')}
    action={onClick}
    iconNode={<PlusIcon weight="bold" />}
    variant="text-secondary"
  />
);

export const StaticRoutesTable: FC<{
  fields;
  fixedIps?: OpenStackFixedIp[];
}> = ({ fields, fixedIps = [] }) => {
  const nexthopValidator = useMemo(
    () => composeValidators(required, validateIPv4, validateFixedIPs(fixedIps)),
    [fixedIps],
  );

  return (
    <>
      {fields.length > 0 ? (
        <>
          <Table
            responsive={true}
            bordered={true}
            striped={true}
            className="mt-3"
          >
            <thead>
              <tr>
                <th>{translate('Destination (CIDR)')}</th>
                <th>{translate('Next hop (IP)')}</th>
                <th>{translate('Actions')}</th>
              </tr>
            </thead>

            <tbody>
              {fields.map((route, index) => (
                <StaticRouteRow
                  key={route}
                  route={route}
                  nexthopValidator={nexthopValidator}
                  onRemove={() => fields.remove(index)}
                />
              ))}
            </tbody>
          </Table>
          <StaticRouteAddButton onClick={() => fields.push({})} />
        </>
      ) : (
        <StaticRouteAddButton onClick={() => fields.push({})} />
      )}
    </>
  );
};
