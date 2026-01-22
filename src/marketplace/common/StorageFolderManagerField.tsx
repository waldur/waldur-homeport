import { QuestionIcon } from '@phosphor-icons/react';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Form, Row, Col, Card } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { OptionField, StorageFolderConfig } from 'waldur-js-client';

import { Tip } from '@waldur/core/Tooltip';
import { Select } from '@waldur/form/themed-select';
import { FormField } from '@waldur/form/types';
import { translate } from '@waldur/i18n';
import { STORAGE_FOLDER_PERMISSIONS } from '@waldur/marketplace/offerings/update/options/constants';

import { DeployFormData } from './types';

interface StorageFolderManagerFieldProps extends FormField {
  field: OptionField;
  customer?: any; // For accessing user context
  offering?: any; // For accessing component limits (optional)
}

export const StorageFolderManagerField = ({
  field,
  input,
  offering,
}: StorageFolderManagerFieldProps) => {
  const config = field.storage_folder_config || ({} as StorageFolderConfig);
  const [localValue, setLocalValue] = useState({
    storage_data_type: '',
    permissions: '',
    hard_quota_space: '',
    ...input?.value,
  });

  const inputRef = useRef(input);
  inputRef.current = input;

  // Watch form values to get current soft quota from component limit
  const formValues = useSelector(
    getFormValues('OrderForm') as (state: any) => DeployFormData,
  );

  // Get soft quota from component limit
  const softQuota = useMemo(() => {
    const componentType = config.component_type;
    if (componentType && formValues?.limits) {
      return formValues.limits[componentType] || 0;
    }

    // Fallback to offering component default limit if available
    const component = offering?.components?.find(
      (c) => c.type === componentType,
    );
    return component?.default_limit || 1; // Default to 1 TB if no offering available
  }, [formValues?.limits, config.component_type, offering]);

  // Calculate quotas in real-time
  const calculatedQuotas = useMemo(() => {
    const hardQuota = localValue.hard_quota_space
      ? parseFloat(localValue.hard_quota_space)
      : softQuota * (config.default_hard_quota_multiplier || 1.0);

    const softInodeMultiplier = config.inode_soft_multiplier || 7000;
    const hardInodeMultiplier = config.inode_hard_multiplier || 10000;
    const softInodes = softQuota * softInodeMultiplier;
    const hardInodes = hardQuota * hardInodeMultiplier;

    return {
      softQuota,
      hardQuota,
      softInodes,
      hardInodes,
    };
  }, [
    localValue.hard_quota_space,
    softQuota,
    config.default_hard_quota_multiplier,
    config.inode_soft_multiplier,
    config.inode_hard_multiplier,
  ]);

  // All standard permissions are always available - uses shared constant from backend
  const availablePermissions = STORAGE_FOLDER_PERMISSIONS;

  // Auto-select default permission when component loads
  useEffect(() => {
    if (!localValue.permissions && config.default_permission) {
      handleFieldChange('permissions', config.default_permission);
    }
  }, [config.default_permission]);

  // Update parent form with calculated values
  useEffect(() => {
    if (inputRef.current?.onChange) {
      const submissionValue = {
        storage_data_type: localValue.storage_data_type,
        permissions: localValue.permissions,
        ...(localValue.hard_quota_space && {
          hard_quota_space: calculatedQuotas.hardQuota,
        }),
        soft_quota_inodes: Math.round(calculatedQuotas.softInodes),
        hard_quota_inodes: Math.round(calculatedQuotas.hardInodes),
      };
      inputRef.current.onChange(submissionValue);
    }
  }, [localValue, calculatedQuotas]);

  // Sync external changes to local state
  useEffect(() => {
    if (input?.value) {
      setLocalValue({ ...localValue, ...input.value });
    }
  }, [input?.value]);

  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    setLocalValue((prev) => ({ ...prev, [fieldName]: value }));
  }, []);

  // Validation: hard quota must not be less than soft quota
  const hardQuotaError = useMemo(() => {
    if (localValue.hard_quota_space) {
      const hardQuota = parseFloat(localValue.hard_quota_space);
      if (hardQuota < softQuota) {
        return translate(
          'Hard quota cannot be less than soft quota ({softQuota} TB)',
          {
            softQuota: softQuota.toFixed(1),
          },
        );
      }
    }
    return null;
  }, [localValue.hard_quota_space, softQuota]);

  const inodeTooltip = translate(
    'Inodes represent individual files and directories. The inode limit restricts how many separate files you can create, regardless of their size. For example, 7 million inodes means you can store up to 7 million individual files.',
  );

  return (
    <div className="storage-folder-manager">
      {field.help_text && (
        <div className="form-text text-muted mb-3">{field.help_text}</div>
      )}

      <Row>
        <Col md={6}>
          <Form.Group>
            <Form.Label>{translate('Storage Data Type')}</Form.Label>
            <Select
              value={
                config.storage_data_types?.find(
                  (type) => type.key === localValue.storage_data_type,
                ) || null
              }
              onChange={(option) =>
                handleFieldChange('storage_data_type', option?.key || '')
              }
              options={config.storage_data_types || []}
              getOptionValue={(option) => option.key}
              getOptionLabel={(option) => option.label}
              isClearable={false}
              placeholder={translate('Select storage data type')}
              required
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>{translate('Permissions')}</Form.Label>
            <Select
              value={
                availablePermissions.find(
                  (perm) => perm.value === localValue.permissions,
                ) || null
              }
              onChange={(option) =>
                handleFieldChange('permissions', option?.value || '')
              }
              options={availablePermissions}
              getOptionValue={(option) => option.value}
              getOptionLabel={(option) => option.label}
              isClearable={false}
              placeholder={translate('Select permissions')}
              required
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mt-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>{translate('Hard Quota Override (TB)')}</Form.Label>
            <Form.Control
              type="number"
              value={localValue.hard_quota_space}
              onChange={(e) =>
                handleFieldChange('hard_quota_space', e.target.value)
              }
              min={softQuota}
              step="0.1"
              placeholder={translate('Optional override')}
              isInvalid={!!hardQuotaError}
            />
            <Form.Text className="text-muted">
              {translate('Leave empty to use default multiplier.')}
            </Form.Text>
            {hardQuotaError && (
              <Form.Control.Feedback type="invalid">
                {hardQuotaError}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
      </Row>

      <Card className="mt-3 bg-light">
        <Card.Header>
          <h6>{translate('Calculated Quotas')}</h6>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <strong>{translate('Space Quotas')}</strong>
              <div>
                {translate('Soft')}: {calculatedQuotas.softQuota.toFixed(1)} TB
              </div>
              <div>
                {translate('Hard')}: {calculatedQuotas.hardQuota.toFixed(1)} TB
              </div>
            </Col>
            <Col md={6}>
              <strong>
                {translate('File/Directory Quotas (Inodes)')}{' '}
                <Tip id="inode-tooltip" label={inodeTooltip}>
                  <QuestionIcon
                    weight="bold"
                    size={16}
                    className="text-muted"
                  />
                </Tip>
              </strong>
              <div>
                {translate('Soft')}:{' '}
                {calculatedQuotas.softInodes.toLocaleString()} files
              </div>
              <div>
                {translate('Hard')}:{' '}
                {calculatedQuotas.hardInodes.toLocaleString()} files
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};
