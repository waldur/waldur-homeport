import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { Field } from 'react-final-form';
import { OpenStackFixedIp } from 'waldur-js-client';

import {
  BaseButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { required, composeValidators } from '@/core/validators';
import { StringField, FieldError } from '@/form';
import { translate } from '@/i18n';

import { validateIPv4 } from '../utils';

const validateFixedIPs = (fixedIps: OpenStackFixedIp[]) => (value: string) => {
  if (fixedIps.some((ip) => ip.ip_address === value)) {
    return translate('IP address is already used by router.');
  }
};

const StaticRouteRow = ({ route, nexthopValidator, onRemove }) => (
  <TableRow>
    <TableCell>
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
    </TableCell>
    <TableCell>
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

const StaticRouteAddButton = ({ onClick }) => (
  <BaseButton
    label={translate('Add route')}
    onClick={onClick}
    iconNode={<PlusIcon weight="bold" />}
    variant="text-secondary"
    size="sm"
  />
);

export const StaticRoutesTable: FC<{
  fields;
  fixedIps?: OpenStackFixedIp[];
  // A subnet's next hops must be in the subnet's own family, which may be
  // IPv6; routers and everything else keep the IPv4 check.
  validateNexthop?: (value, allValues?) => string | undefined;
}> = ({ fields, fixedIps = [], validateNexthop = validateIPv4 }) => {
  const nexthopValidator = useMemo(
    () =>
      composeValidators(required, validateNexthop, validateFixedIPs(fixedIps)),
    [fixedIps, validateNexthop],
  );

  return (
    <>
      {fields.length > 0 ? (
        <>
          <Table className="mt-2.5">
            <TableHeader>
              <TableRow>
                <TableHead>{translate('Destination (CIDR)')}</TableHead>
                <TableHead>{translate('Next hop (IP)')}</TableHead>
                <TableHead>{translate('Actions')}</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {fields.map((route, index) => (
                <StaticRouteRow
                  key={route}
                  route={route}
                  nexthopValidator={nexthopValidator}
                  onRemove={() => fields.remove(index)}
                />
              ))}
            </TableBody>
          </Table>
          <StaticRouteAddButton onClick={() => fields.push({})} />
        </>
      ) : (
        <StaticRouteAddButton onClick={() => fields.push({})} />
      )}
    </>
  );
};
