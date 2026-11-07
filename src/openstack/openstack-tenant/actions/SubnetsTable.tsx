import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Field } from 'react-final-form';
import { OpenStackSubNet } from 'waldur-js-client';

import {
  BaseButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { SelectField } from '@/form';
import { InputField } from '@/form/InputField';
import { translate } from '@/i18n';

const getSubnetLabel = (subnet: OpenStackSubNet) =>
  subnet.name ? `${subnet.name} (${subnet.cidr})` : subnet.cidr;

const SubNetRow = ({ SubNet: subnet, onRemove, sourceSubnets }) => (
  <TableRow>
    <TableCell>
      <Field name={`${subnet}.source`}>
        {({ input, meta }) => (
          <SelectField
            input={input}
            meta={meta}
            options={sourceSubnets}
            getOptionLabel={getSubnetLabel}
            getOptionValue={({ cidr }) => cidr}
            simpleValue
          />
        )}
      </Field>
    </TableCell>
    <TableCell>
      <Field name={`${subnet}.destination`}>
        {({ input, meta }) => <InputField input={input} meta={meta} />}
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

const SubNetAddButton = ({ onClick }) => (
  <BaseButton
    label={translate('Add')}
    onClick={onClick}
    iconNode={<PlusIcon weight="bold" />}
    variant="text-secondary"
    size="sm"
  />
);

export const SubnetsTable: FC<{ fields; sourceSubnets }> = ({
  fields,
  sourceSubnets,
}) => {
  return (
    <>
      {fields.length > 0 ? (
        <>
          <Table density="compact" className="mt-2.5">
            <TableHeader>
              <TableRow>
                <TableHead>{translate('Source')}</TableHead>
                <TableHead>{translate('Destination')}</TableHead>
                <TableHead>{translate('Actions')}</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {fields.map((subnet, index) => (
                <SubNetRow
                  key={subnet}
                  SubNet={subnet}
                  sourceSubnets={sourceSubnets}
                  onRemove={() => fields.remove(index)}
                />
              ))}
            </TableBody>
          </Table>
          <SubNetAddButton onClick={() => fields.push({})} />
        </>
      ) : (
        <SubNetAddButton onClick={() => fields.push({})} />
      )}
    </>
  );
};
