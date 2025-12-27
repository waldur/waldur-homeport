import { InfoIcon } from '@phosphor-icons/react';
import React from 'react';
import { Alert } from 'react-bootstrap';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { SelectField } from '@waldur/form';
import { translate } from '@waldur/i18n';

import { FormGroup } from '../offerings/FormGroup';

import { K8sFormSection } from './K8sFormSection';
import {
  K8sDefaultConfiguration,
  getAvailableKubernetesVersions,
  validateK8sConfiguration,
  isK8sConfigurationComplete,
} from './multi-datacenter-k8s-types';

interface K8sKubernetesConfigSectionProps {
  defaultConfigs?: K8sDefaultConfiguration;
  kubernetesVersion: string;
  onKubernetesVersionChange: (version: string) => void;
  installLonghorn: boolean;
  onLonghornChange: (value: boolean) => void;
  longhornDescription?: string;
}

export const K8sKubernetesConfigSection: React.FC<
  K8sKubernetesConfigSectionProps
> = ({
  defaultConfigs,
  kubernetesVersion,
  onKubernetesVersionChange,
  installLonghorn,
  onLonghornChange,
  longhornDescription,
}) => {
  const configurationWarnings = validateK8sConfiguration(defaultConfigs);
  const isConfigComplete = isK8sConfigurationComplete(defaultConfigs);

  return (
    <>
      {/* Configuration Warnings */}
      {configurationWarnings.length > 0 && (
        <Alert variant="warning" className="mb-4">
          <InfoIcon className="me-2" size={16} weight="bold" />
          <strong>{translate('Configuration incomplete')}</strong>
          <ul className="mb-0 mt-2">
            {configurationWarnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Kubernetes Version Selection */}
      <K8sFormSection title={translate('Kubernetes configuration')}>
        <FormGroup label={translate('Kubernetes version')} required space={5}>
          <SelectField
            input={{
              value: kubernetesVersion,
              onChange: onKubernetesVersionChange,
              onBlur: () => {},
            }}
            placeholder={
              isConfigComplete
                ? translate('Select kubernetes version...')
                : translate(
                    'Configuration incomplete - please configure offering settings',
                  )
            }
            simpleValue
            isDisabled={!isConfigComplete}
            options={getAvailableKubernetesVersions(defaultConfigs)}
          />
        </FormGroup>

        <FormGroup space={5}>
          <AwesomeCheckbox
            type="checkbox"
            label={translate('Install Longhorn distributed storage')}
            description={
              longhornDescription ||
              translate(
                'Automatically install Longhorn for cloud-native distributed block storage.',
              )
            }
            id="install-longhorn"
            value={installLonghorn}
            onChange={onLonghornChange}
          />
        </FormGroup>
      </K8sFormSection>
    </>
  );
};
