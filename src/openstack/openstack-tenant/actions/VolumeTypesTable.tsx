import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Table } from 'react-bootstrap';
import { Field } from 'redux-form';

import { SelectField } from '@/form';
import { translate } from '@/i18n';
import { CompactActionButton } from '@/table/CompactActionButton';

const VolumeTypeRow = ({ volumeType, onRemove, options }) => (
  <tr>
    <td>
      <Field
        name={`${volumeType}.source`}
        component={SelectField}
        options={options.sourceVolumeTypes}
        getOptionLabel={({ name }) => name}
        getOptionValue={({ uuid }) => uuid}
      />
    </td>
    <td>
      <Field
        name={`${volumeType}.destination`}
        component={SelectField}
        options={options.destinationVolumeTypes}
        getOptionLabel={({ name }) => name}
        getOptionValue={({ uuid }) => uuid}
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

const VolumeTypeAddButton = ({ onClick }) => (
  <CompactActionButton
    title={translate('Add')}
    action={onClick}
    iconNode={<PlusIcon weight="bold" />}
    variant="text-secondary"
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
          <Table
            responsive={true}
            bordered={true}
            striped={true}
            className="mt-3"
          >
            <thead>
              <tr>
                <th>{translate('Source')}</th>
                <th>{translate('Destination')}</th>
                <th>{translate('Actions')}</th>
              </tr>
            </thead>

            <tbody>
              {fields.map((volumeType, index) => (
                <VolumeTypeRow
                  key={volumeType}
                  volumeType={volumeType}
                  options={options}
                  onRemove={() => fields.remove(index)}
                />
              ))}
            </tbody>
          </Table>
          <VolumeTypeAddButton onClick={() => fields.push({})} />
        </>
      ) : (
        <VolumeTypeAddButton onClick={() => fields.push({})} />
      )}
    </>
  );
};
