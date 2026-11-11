import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { FC } from 'react';
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

import { SelectField } from '@/form';
import { translate } from '@/i18n';

const VolumeTypeRow = ({ volumeType, onRemove, options }) => (
  <TableRow>
    <TableCell>
      <Field name={`${volumeType}.source`}>
        {({ input, meta }) => (
          <SelectField
            input={input}
            meta={meta}
            options={options.sourceVolumeTypes}
            getOptionLabel={({ name }) => name}
            getOptionValue={({ uuid }) => uuid}
          />
        )}
      </Field>
    </TableCell>
    <TableCell>
      <Field name={`${volumeType}.destination`}>
        {({ input, meta }) => (
          <SelectField
            input={input}
            meta={meta}
            options={options.destinationVolumeTypes}
            getOptionLabel={({ name }) => name}
            getOptionValue={({ uuid }) => uuid}
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

const VolumeTypeAddButton = ({ onClick }) => (
  <BaseButton
    label={translate('Add')}
    onClick={onClick}
    iconNode={<PlusIcon weight="bold" />}
    variant="text-secondary"
    size="sm"
  />
);

export const VolumeTypesTable: FC<{ fields; options }> = ({
  fields,
  options,
}) => {
  return (
    <>
      {fields.length > 0 ? (
        <>
          <Table className="mt-2.5">
            <TableHeader>
              <TableRow>
                <TableHead>{translate('Source')}</TableHead>
                <TableHead>{translate('Destination')}</TableHead>
                <TableHead>{translate('Actions')}</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {fields.map((volumeType, index) => (
                <VolumeTypeRow
                  key={volumeType}
                  volumeType={volumeType}
                  options={options}
                  onRemove={() => fields.remove(index)}
                />
              ))}
            </TableBody>
          </Table>
          <VolumeTypeAddButton onClick={() => fields.push({})} />
        </>
      ) : (
        <VolumeTypeAddButton onClick={() => fields.push({})} />
      )}
    </>
  );
};
