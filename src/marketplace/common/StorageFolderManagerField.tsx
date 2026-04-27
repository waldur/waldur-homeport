import { QuestionIcon } from '@phosphor-icons/react';
import { useCallback, useEffect, useMemo } from 'react';
import { Card, Col, Form, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { OptionField, StorageFolderConfig } from 'waldur-js-client';

import { Tip } from '@/core/Tooltip';
import { Select } from '@/form/themed-select';
import { FormField } from '@/form/types';
import { translate } from '@/i18n';
import { STORAGE_FOLDER_PERMISSIONS } from '@/marketplace/offerings/update/options/constants';

import { orderFormDataSelector } from '../deploy/selectors';

import { DeployFormData } from './types';

// Types
interface StorageFolderManagerFieldProps extends FormField {
  field: OptionField;
  customer?: any;
  offering?: any;
}

interface StorageFormValue {
  storage_data_type: string;
  permissions: string;
  hard_quota_space: string;
}

interface CalculatedQuotas {
  softQuota: number;
  hardQuota: number;
  softInodes: number;
  hardInodes: number;
}

interface SubmissionValue {
  storage_data_type: string;
  permissions: string;
  hard_quota_space?: number;
  soft_quota_inodes: number;
  hard_quota_inodes: number;
}

// Custom hooks
const useSoftQuota = (
  config: StorageFolderConfig,
  formValues: DeployFormData | undefined,
  offering: any,
): number => {
  return useMemo(() => {
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
};

const useCalculatedQuotas = (
  currentValue: StorageFormValue,
  softQuota: number,
  config: StorageFolderConfig,
): CalculatedQuotas => {
  return useMemo(() => {
    const hardQuota = currentValue.hard_quota_space
      ? parseFloat(currentValue.hard_quota_space)
      : softQuota * (config.default_hard_quota_multiplier || 1.0);

    const softInodeMultiplier = config.inode_soft_multiplier || 7000;
    const hardInodeMultiplier = config.inode_hard_multiplier || 10000;
    const softInodes = softQuota * softInodeMultiplier;
    const hardInodes = hardQuota * hardInodeMultiplier;

    return { softQuota, hardQuota, softInodes, hardInodes };
  }, [
    currentValue.hard_quota_space,
    softQuota,
    config.default_hard_quota_multiplier,
    config.inode_soft_multiplier,
    config.inode_hard_multiplier,
  ]);
};

const useQuotaValidation = (
  currentValue: StorageFormValue,
  softQuota: number,
): string | null => {
  return useMemo(() => {
    if (currentValue.hard_quota_space) {
      const hardQuota = parseFloat(currentValue.hard_quota_space);
      if (hardQuota < softQuota) {
        return translate(
          'Hard quota cannot be less than soft quota ({softQuota} TB)',
          { softQuota: softQuota.toFixed(1) },
        );
      }
    }
    return null;
  }, [currentValue.hard_quota_space, softQuota]);
};

// Helper functions
const createSubmissionValue = (
  currentValue: StorageFormValue,
  calculatedQuotas: CalculatedQuotas,
): SubmissionValue => ({
  storage_data_type: currentValue.storage_data_type,
  permissions: currentValue.permissions,
  hard_quota_space: currentValue.hard_quota_space
    ? calculatedQuotas.hardQuota
    : undefined,
  soft_quota_inodes: Math.round(calculatedQuotas.softInodes),
  hard_quota_inodes: Math.round(calculatedQuotas.hardInodes),
});

const hasValueChanged = (
  newValue: SubmissionValue,
  currentValue: Partial<SubmissionValue>,
): boolean => {
  return (
    newValue.storage_data_type !== currentValue.storage_data_type ||
    newValue.permissions !== currentValue.permissions ||
    newValue.hard_quota_space !== currentValue.hard_quota_space ||
    newValue.soft_quota_inodes !== currentValue.soft_quota_inodes ||
    newValue.hard_quota_inodes !== currentValue.hard_quota_inodes
  );
};

const getDefaultFormValue = (
  config: StorageFolderConfig,
): StorageFormValue => ({
  storage_data_type: '',
  permissions: config.default_permission || '',
  hard_quota_space: '',
});

// Component
export const StorageFolderManagerField = ({
  field,
  input,
  offering,
}: StorageFolderManagerFieldProps) => {
  const config = field.storage_folder_config || ({} as StorageFolderConfig);

  // Use input.value directly instead of local state
  const currentValue: StorageFormValue = useMemo(
    () => ({
      ...getDefaultFormValue(config),
      ...input?.value,
    }),
    [input?.value, config],
  );

  const formValues = useSelector(orderFormDataSelector);

  const softQuota = useSoftQuota(config, formValues, offering);
  const calculatedQuotas = useCalculatedQuotas(currentValue, softQuota, config);
  const hardQuotaError = useQuotaValidation(currentValue, softQuota);

  // Auto-select default permission on mount
  useEffect(() => {
    if (!currentValue.permissions && config.default_permission) {
      handleFieldChange('permissions', config.default_permission);
    }
  }, []);

  // Sync parent form with calculated values
  useEffect(() => {
    if (!input?.onChange) return;

    const submissionValue = createSubmissionValue(
      currentValue,
      calculatedQuotas,
    );
    const existingValue = input.value || {};

    if (hasValueChanged(submissionValue, existingValue)) {
      input.onChange(submissionValue);
    }
  }, [currentValue, calculatedQuotas, input]);

  const handleFieldChange = useCallback(
    (fieldName: string, value: any) => {
      if (!input?.onChange) return;

      const updatedValue = {
        ...currentValue,
        [fieldName]: value,
      };

      // Calculate new quotas immediately for the updated value
      const hardQuota = updatedValue.hard_quota_space
        ? parseFloat(updatedValue.hard_quota_space)
        : softQuota * (config.default_hard_quota_multiplier || 1.0);

      const softInodeMultiplier = config.inode_soft_multiplier || 7000;
      const hardInodeMultiplier = config.inode_hard_multiplier || 10000;
      const softInodes = softQuota * softInodeMultiplier;
      const hardInodes = hardQuota * hardInodeMultiplier;

      input.onChange({
        storage_data_type: updatedValue.storage_data_type,
        permissions: updatedValue.permissions,
        hard_quota_space: updatedValue.hard_quota_space ? hardQuota : undefined,
        soft_quota_inodes: Math.round(softInodes),
        hard_quota_inodes: Math.round(hardInodes),
      });
    },
    [currentValue, softQuota, config, input],
  );

  return (
    <div className="storage-folder-manager">
      {field.help_text && (
        <div className="form-text text-muted mb-3">{field.help_text}</div>
      )}

      <StorageTypeAndPermissions
        config={config}
        currentValue={currentValue}
        onFieldChange={handleFieldChange}
      />

      <HardQuotaOverride
        currentValue={currentValue}
        softQuota={softQuota}
        hardQuotaError={hardQuotaError}
        onFieldChange={handleFieldChange}
      />

      <QuotaSummaryCard calculatedQuotas={calculatedQuotas} />
    </div>
  );
};

// Sub-components
interface StorageTypeAndPermissionsProps {
  config: StorageFolderConfig;
  currentValue: StorageFormValue;
  onFieldChange: (fieldName: string, value: any) => void;
}

const StorageTypeAndPermissions = ({
  config,
  currentValue,
  onFieldChange,
}: StorageTypeAndPermissionsProps) => (
  <Row>
    <Col md={6}>
      <Form.Group>
        <Form.Label>{translate('Storage Data Type')}</Form.Label>
        <Select
          value={
            config.storage_data_types?.find(
              (type) => type.key === currentValue.storage_data_type,
            ) || null
          }
          onChange={(option) =>
            onFieldChange('storage_data_type', option?.key || '')
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
            STORAGE_FOLDER_PERMISSIONS.find(
              (perm) => perm.value === currentValue.permissions,
            ) || null
          }
          onChange={(option) =>
            onFieldChange('permissions', option?.value || '')
          }
          options={STORAGE_FOLDER_PERMISSIONS}
          getOptionValue={(option) => option.value}
          getOptionLabel={(option) => option.label}
          isClearable={false}
          placeholder={translate('Select permissions')}
          required
        />
      </Form.Group>
    </Col>
  </Row>
);

interface HardQuotaOverrideProps {
  currentValue: StorageFormValue;
  softQuota: number;
  hardQuotaError: string | null;
  onFieldChange: (fieldName: string, value: any) => void;
}

const HardQuotaOverride = ({
  currentValue,
  softQuota,
  hardQuotaError,
  onFieldChange,
}: HardQuotaOverrideProps) => (
  <Row className="mt-3">
    <Col md={6}>
      <Form.Group>
        <Form.Label>{translate('Hard Quota Override (TB)')}</Form.Label>
        <Form.Control
          type="number"
          value={currentValue.hard_quota_space || ''}
          onChange={(e) => onFieldChange('hard_quota_space', e.target.value)}
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
);

const QuotaSummaryCard = ({
  calculatedQuotas,
}: {
  calculatedQuotas: CalculatedQuotas;
}) => {
  const inodeTooltip = translate(
    'Inodes represent individual files and directories. The inode limit restricts how many separate files you can create, regardless of their size. For example, 7 million inodes means you can store up to 7 million individual files.',
  );

  return (
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
                <QuestionIcon weight="bold" size={16} className="text-muted" />
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
  );
};
