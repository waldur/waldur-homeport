import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import React from 'react';
import { Field } from 'react-final-form';

import {
  BaseButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { FieldError } from '@/form/FieldError';
import { BaseInputField } from '@/form/InputField';
import { translate } from '@/i18n';

import { validateIPv4 } from '../utils';

const IPAddressRow = ({ address, validateAddress, onRemove }) => (
  <TableRow>
    <TableCell>
      <Field name={address} validate={validateAddress}>
        {({ input, meta }) => (
          <>
            <BaseInputField {...input} aria-label={translate('IP address')} />
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

const IPAddressAddButton = ({ onClick }) => (
  <BaseButton
    label={translate('Add address')}
    onClick={onClick}
    iconNode={<PlusIcon weight="bold" />}
    variant="text-secondary"
    size="sm"
  />
);

// A subnet's nameservers must be in the subnet's own family, which may be
// IPv6; every other list keeps the IPv4 check.
export const IpAddressList: React.FC<any> = ({
  fields,
  validateAddress = validateIPv4,
}) => (
  <>
    {fields.length > 0 ? (
      <>
        <Table striped className="mt-2.5">
          <TableHeader>
            <TableRow>
              <TableHead>{translate('IP address')}</TableHead>
              <TableHead>{translate('Actions')}</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {fields.map((address, index) => (
              <IPAddressRow
                key={address}
                address={address}
                validateAddress={validateAddress}
                onRemove={() => fields.remove(index)}
              />
            ))}
          </TableBody>
        </Table>
        <IPAddressAddButton onClick={() => fields.push('')} />
      </>
    ) : (
      <IPAddressAddButton onClick={() => fields.push('')} />
    )}
  </>
);
