import { FieldArray } from 'react-final-form-arrays';
import { OfferingComponent } from 'waldur-js-client';

import { required } from '@/core/validators';
import { NumberGroup, SelectGroup } from '@/form';
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
      <SelectGroup
        name={`${name}.component_type`}
        label={translate('Component Type')}
        description={translate(
          'Limit-based component that defines soft space quota',
        )}
        required
        validate={required}
        options={componentOptions}
        isClearable={false}
        placeholder={translate('Select component')}
        getOptionValue={(option) => option.value}
        getOptionLabel={(option) => option.label}
        simpleValue
      />
      <NumberGroup
        label={translate('Default Hard Quota Multiplier')}
        description={translate(
          'Default multiplier for hard quota (1.0 = same as soft quota)',
        )}
        name={`${name}.default_hard_quota_multiplier`}
        type="number"
        min="1"
        step="0.1"
        placeholder="1.0"
      />
      <NumberGroup
        label={translate('Inode Soft Multiplier')}
        description={translate('Number of inodes per TB for soft quota.')}
        help={translate(
          'What are inodes? Each file and directory uses one inode. This setting determines how many individual files users can store per TB. Example: 7000 inodes/TB means users can store up to 7,000 files per terabyte of space.',
        )}
        helpEnd
        name={`${name}.inode_soft_multiplier`}
        type="number"
        min="1"
        placeholder="7000"
      />
      <NumberGroup
        name={`${name}.inode_hard_multiplier`}
        type="number"
        label={translate('Inode Hard Multiplier')}
        description={translate(
          'Number of inodes per TB for hard quota (should be ≥ soft multiplier).',
        )}
        min="1"
        placeholder="10000"
        forceTouched
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
      <SelectGroup
        name={`${name}.default_permission`}
        label={translate('Default Permission')}
        description={translate(
          'Permission that will be auto-selected for users',
        )}
        required
        validate={required}
        options={STORAGE_FOLDER_PERMISSIONS}
        isClearable={false}
        placeholder={translate('Select default permission')}
        getOptionValue={(option) => option.value}
        getOptionLabel={(option) => option.label}
        simpleValue
      />
    </>
  );
};
