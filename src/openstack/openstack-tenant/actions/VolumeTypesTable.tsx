import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Field } from 'react-final-form';

import { BaseButton } from 'waldur-ui';

import { SelectField } from '@/form';
import { translate } from '@/i18n';

const VolumeTypeRow = ({ volumeType, onRemove, options }) => (
  <tr>
    <td>
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
    </td>
    <td>
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
    </td>
    <td>
      <BaseButton
        label={translate('Remove')}
        onClick={onRemove}
        iconNode={<TrashIcon weight="bold" />}
        variant="text-secondary"
        size="sm"
      />
    </td>
  </tr>
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
          <div className="table-responsive">
            <table className="table table-bordered table-striped mt-2.5">
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
            </table>
          </div>
          <VolumeTypeAddButton onClick={() => fields.push({})} />
        </>
      ) : (
        <VolumeTypeAddButton onClick={() => fields.push({})} />
      )}
    </>
  );
};
