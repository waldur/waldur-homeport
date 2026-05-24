import { Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { OfferingComponent } from 'waldur-js-client';

import { required } from '@/core/validators';
import { InputField } from '@/form/InputField';
import { Select } from '@/form/select';
import { translate } from '@/i18n';

import { FormGroup } from '../../FormGroup';

import { STORAGE_FOLDER_PERMISSIONS } from './constants';
import { StorageDataTypeArrayField } from './StorageDataTypeArrayField';

interface StorageFolderConfigurationProps {
  offering?: {
    components?: OfferingComponent[];
  };
}

export const StorageFolderConfiguration = ({
  offering,
}: StorageFolderConfigurationProps) => {
  const name = 'storage_folder_config';
  // Filter only limit-based components
  const limitComponents =
    offering?.components?.filter(
      (component) => component.billing_type === 'limit',
    ) || [];

  const componentOptions = limitComponents.map((component) => ({
    value: component.type,
    label: `${component.name} (${component.type})`,
  }));

  return (
    <>
      <FormGroup
        label={translate('Component Type')}
        description={translate(
          'Limit-based component that defines soft space quota',
        )}
        required
      >
        <Field
          name={`${name}.component_type`}
          validate={required}
          render={(fieldProps) => (
            <Select
              value={componentOptions.find(
                (opt) => opt.value === fieldProps.input.value,
              )}
              onChange={(option) => fieldProps.input.onChange(option?.value)}
              options={componentOptions}
              isClearable={false}
              placeholder={translate('Select component')}
              getOptionValue={(option) => option.value}
              getOptionLabel={(option) => option.label}
            />
          )}
        />
      </FormGroup>

      <FormGroup
        label={translate('Default Hard Quota Multiplier')}
        description={translate(
          'Default multiplier for hard quota (1.0 = same as soft quota)',
        )}
      >
        <Field
          name={`${name}.default_hard_quota_multiplier`}
          component={InputField}
          type="number"
          min="1"
          step="0.1"
          placeholder="1.0"
        />
      </FormGroup>

      <FormGroup
        label={translate('Inode Soft Multiplier')}
        description={translate('Number of inodes per TB for soft quota.')}
        help={translate(
          'What are inodes? Each file and directory uses one inode. This setting determines how many individual files users can store per TB. Example: 7000 inodes/TB means users can store up to 7,000 files per terabyte of space.',
        )}
        helpEnd
      >
        <Field
          name={`${name}.inode_soft_multiplier`}
          component={InputField}
          type="number"
          min="1"
          placeholder="7000"
        />
      </FormGroup>

      <Field
        name={`${name}.inode_hard_multiplier`}
        type="number"
        render={({ input, meta, ...props }) => (
          <FormGroup
            label={translate('Inode Hard Multiplier')}
            description={translate(
              'Number of inodes per TB for hard quota (should be ≥ soft multiplier).',
            )}
            meta={{ ...meta, touched: true }} // Force error display for cross-field validation
          >
            <InputField input={input} {...props} />
          </FormGroup>
        )}
        min="1"
        placeholder="10000"
      />

      <FormGroup
        label={translate('Storage Data Types')}
        description={translate('Available storage data type options')}
        required
      >
        <FieldArray
          name={`${name}.storage_data_types`}
          component={StorageDataTypeArrayField}
        />
      </FormGroup>

      <FormGroup
        label={translate('Default Permission')}
        description={translate(
          'Permission that will be auto-selected for users',
        )}
        required
      >
        <Field
          name={`${name}.default_permission`}
          validate={required}
          render={(fieldProps) => (
            <Select
              value={
                STORAGE_FOLDER_PERMISSIONS.find(
                  (opt) => opt.value === fieldProps.input.value,
                ) || null
              }
              onChange={(option) => fieldProps.input.onChange(option?.value)}
              options={STORAGE_FOLDER_PERMISSIONS}
              isClearable={false}
              placeholder={translate('Select default permission')}
              getOptionValue={(option) => option.value}
              getOptionLabel={(option) => option.label}
            />
          )}
        />
      </FormGroup>
    </>
  );
};
