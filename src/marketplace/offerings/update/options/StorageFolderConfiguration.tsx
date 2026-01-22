import { Card, Col, Row } from 'react-bootstrap';
import { Field, FieldArray } from 'redux-form';
import { OfferingComponent } from 'waldur-js-client';

import { required } from '@waldur/core/validators';
import { InputField } from '@waldur/form/InputField';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { CompactActionButton } from '@waldur/table/CompactActionButton';

import { FormGroup } from '../../FormGroup';

import { STORAGE_FOLDER_PERMISSIONS } from './constants';

interface StorageFolderConfigurationProps {
  name: string;
  offering?: {
    components?: OfferingComponent[];
  };
}

const StorageDataTypeArrayField = ({ fields, meta: { touched, error } }) => (
  <div>
    {fields.map((member, index) => (
      <Card key={index} className="mb-3">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span className="fw-bold">
            {translate('Storage Data Type')} #{index + 1}
          </span>
          <CompactActionButton
            title={translate('Remove')}
            variant="danger"
            action={() => fields.remove(index)}
          />
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <Field
                name={`${member}.key`}
                component={InputField}
                label={translate('Key')}
                help_text={translate(
                  'Internal identifier (lowercase, no spaces)',
                )}
                placeholder={translate('Key')}
                validate={required}
              />
            </Col>
            <Col md={6}>
              <Field
                name={`${member}.label`}
                component={InputField}
                label={translate('Display Label')}
                help_text={translate('User-friendly name shown in dropdown')}
                placeholder={translate('Display Label')}
                validate={required}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>
    ))}
    <CompactActionButton
      title={translate('Add Storage Data Type')}
      variant="outline-primary"
      action={() => fields.push({ key: '', label: '' })}
    />
    {touched && error && (
      <div className="invalid-feedback d-block">{error}</div>
    )}
  </div>
);

export const StorageFolderConfiguration = ({
  name,
  offering,
}: StorageFolderConfigurationProps) => {
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
          component={(fieldProps) => (
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

      <FormGroup
        label={translate('Inode Hard Multiplier')}
        description={translate(
          'Number of inodes per TB for hard quota (should be ≥ soft multiplier).',
        )}
      >
        <Field
          name={`${name}.inode_hard_multiplier`}
          component={InputField}
          type="number"
          min="1"
          placeholder="10000"
        />
      </FormGroup>

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
          component={(fieldProps) => (
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
