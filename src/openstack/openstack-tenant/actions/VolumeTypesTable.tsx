import { Plus, Trash } from '@phosphor-icons/react';
import { FC } from 'react';
import { Button, Table } from 'react-bootstrap';
import { Field } from 'redux-form';

import { SelectField } from '@waldur/form';
import { translate } from '@waldur/i18n';

const VolumeTypeRow = ({ volumeType, onRemove, options }) => (
  <tr>
    <td>
      <Field
        name={`${volumeType}.source`}
        component={SelectField}
        options={options.sourceVolumeTypes}
        getOptionLabel={({ name }) => name}
        getOptionKey={({ uuid }) => uuid}
      />
    </td>
    <td>
      <Field
        name={`${volumeType}.destination`}
        component={SelectField}
        options={options.destinationVolumeTypes}
        getOptionLabel={({ name }) => name}
        getOptionKey={({ uuid }) => uuid}
      />
    </td>
    <td>
      <Button variant="default" onClick={onRemove} size="sm">
        <span className="svg-icon svg-icon-2">
          <Trash />
        </span>{' '}
        {translate('Remove')}
      </Button>
    </td>
  </tr>
);

const VolumeTypeAddButton = ({ onClick }) => (
  <Button variant="default" onClick={onClick} size="sm">
    <span className="svg-icon svg-icon-2">
      <Plus />
    </span>{' '}
    {translate('Add')}
  </Button>
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
