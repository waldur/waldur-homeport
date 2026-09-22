import React from 'react';

import { AlertItem } from 'waldur-ui';

import { AwesomeCheckbox } from '@/core/AwesomeCheckbox';
import { SelectField } from '@/form';
import { FormGroup } from '@/form';
import { translate } from '@/i18n';

import { K8sFormSection } from './K8sFormSection';
import {
  K8sClusterTopology,
  K8sDefaultConfiguration,
  getAvailableKubernetesVersions,
  getTopologyOptions,
  getLoadBalancerMode,
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
  loadBalancer?: boolean;
  onLoadBalancerChange?: (value: boolean) => void;
  topology?: K8sClusterTopology;
  // Given only when the offering lets the customer pick the topology.
  onTopologyChange?: (value: K8sClusterTopology) => void;
  topologyNotice?: string;
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
  loadBalancer,
  onLoadBalancerChange,
  topology,
  onTopologyChange,
  topologyNotice,
}) => {
  const configurationWarnings = validateK8sConfiguration(defaultConfigs);
  const isConfigComplete = isK8sConfigurationComplete(defaultConfigs);

  return (
    <>
      {/* Configuration Warnings */}
      {configurationWarnings.length > 0 && (
        <AlertItem
          type="floating"
          variant="warning"
          className="mb-4"
          title={translate('Configuration incomplete')}
          body={
            <ul className="mb-0 mt-2">
              {configurationWarnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          }
        />
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

        {onTopologyChange && (
          <FormGroup
            label={translate('Cluster topology')}
            description={translate(
              'Where the controller nodes run: three in one site, or one in each of three sites.',
            )}
            required
            space={5}
          >
            <SelectField
              input={{
                value: topology,
                onChange: onTopologyChange,
                onBlur: () => {},
              }}
              simpleValue
              isClearable={false}
              options={getTopologyOptions()}
            />
            {topologyNotice && (
              <AlertItem
                type="floating"
                variant="info"
                className="mt-3 mb-0"
                title={topologyNotice}
              />
            )}
          </FormGroup>
        )}

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

        {getLoadBalancerMode(defaultConfigs) === 'optional' &&
          onLoadBalancerChange && (
            <FormGroup space={5}>
              <AwesomeCheckbox
                type="checkbox"
                label={translate('Include load balancer nodes')}
                description={translate(
                  'Add dedicated load balancer nodes for ingress and service exposure.',
                )}
                id="include-load-balancer"
                value={loadBalancer}
                onChange={onLoadBalancerChange}
              />
            </FormGroup>
          )}
      </K8sFormSection>
    </>
  );
};
