import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { useField } from 'react-final-form';
import { LoadBalancerModeEnum, TopologyModeEnum } from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { required } from '@/core/validators';
import { StringGroup, NumberGroup, SelectGroup } from '@/form';
import { translate } from '@/i18n';
import { K8sFormSection } from '@/marketplace/common/K8sFormSection';

const getLoadBalancerModeOptions = (): Array<{
  value: LoadBalancerModeEnum;
  label: string;
}> => [
  { value: 'required', label: translate('Always included') },
  { value: 'optional', label: translate('Customer chooses') },
  { value: 'disabled', label: translate('Not offered') },
];

const getTopologyModeOptions = (): Array<{
  value: TopologyModeEnum;
  label: string;
}> => [
  { value: '1-datacenter', label: translate('Single site, 3 controllers') },
  {
    value: '3-datacenter',
    label: translate('Three sites, 1 controller each'),
  },
  { value: 'customer_choice', label: translate('Customer chooses') },
];

export const K8sDefaultsConfiguration: React.FC<{}> = () => {
  const name = 'default_configs';
  const {
    input: { value: optionType },
  } = useField<{ value?: string }>('type', {
    subscription: { value: true },
  });
  const {
    input: { value: loadBalancerMode },
  } = useField<LoadBalancerModeEnum>(`${name}.load_balancer_mode`, {
    subscription: { value: true },
  });
  return (
    <>
      <K8sFormSection
        title={translate('Default Kubernetes Infrastructure Sizing')}
        subtitle={translate(
          'Configure default resource allocations for controller nodes, load balancers, and storage volumes. These values will be used as defaults when users create new clusters.',
        )}
      >
        <AlertItem
          variant="info"
          type="floating"
          // Same 17.5px step the fields below use.
          className="mb-5"
          title={translate('Configuration Guide')}
          body={
            <>
              <p className="mb-2">
                {translate(
                  'To make this Kubernetes option fully functional, you need to configure:',
                )}
              </p>
              <ul className="mb-2">
                <li>
                  <strong>{translate('Kubernetes Versions')}</strong>{' '}
                  {translate('(Required - see section below)')}
                </li>
                <li>
                  <strong>{translate('Default Resource Sizing')}</strong>{' '}
                  {translate('(Optional - improves user experience)')}
                </li>
              </ul>
              <p className="mb-0">
                {translate(
                  'Without Kubernetes versions configured, users will see a warning and cannot create clusters.',
                )}
              </p>
            </>
          }
        />
        <SelectGroup
          space={5}
          name={`${name}.topology_mode`}
          label={translate('Cluster topology')}
          description={translate(
            'Where the controller nodes run: three in one site, or one in each of three sites. When not set, the option type decides.',
          )}
          options={getTopologyModeOptions()}
          placeholder={
            optionType?.value === 'multi_datacenter_k8s_config'
              ? translate('Three sites, 1 controller each')
              : translate('Single site, 3 controllers')
          }
          // Clearing hands the choice back to the option type.
          isClearable
          parse={(value) => value || undefined}
          simpleValue
        />
      </K8sFormSection>

      <K8sFormSection
        title={translate('Controller Node Defaults')}
        topSeparator
      >
        <Row>
          <Col md={6}>
            <NumberGroup
              space={5}
              label={translate('vCPUs per Controller')}
              tooltipEnd
              help={translate(
                'Number of vCPUs allocated to each controller node',
              )}
              name={`${name}.default_controller_vcpus`}
              type="number"
              min="1"
              max="16"
              parse={(value) => (value ? parseInt(value, 10) : undefined)}
            />
          </Col>
          <Col md={6}>
            <NumberGroup
              space={5}
              label={translate('RAM per Controller (GB)')}
              tooltipEnd
              help={translate(
                'Amount of RAM in GB allocated to each controller node',
              )}
              name={`${name}.default_controller_ram_gb`}
              type="number"
              min="1"
              max="64"
              parse={(value) => (value ? parseInt(value, 10) : undefined)}
            />
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <NumberGroup
              space={5}
              label={translate('System Disk per Controller (GB)')}
              tooltipEnd
              help={translate(
                'Size of system disk in GB for each controller node',
              )}
              name={`${name}.default_controller_system_disk_gb`}
              type="number"
              min="1"
              max="500"
              parse={(value) => (value ? parseInt(value, 10) : undefined)}
            />
          </Col>
          <Col md={6}>
            <NumberGroup
              space={5}
              label={translate('Data Disk per Controller (GB)')}
              tooltipEnd
              help={translate(
                'Size of data disk in GB for each controller node',
              )}
              name={`${name}.default_controller_etcd_disk_gb`}
              type="number"
              min="1"
              max="1000"
              parse={(value) => (value ? parseInt(value, 10) : undefined)}
            />
          </Col>
        </Row>
      </K8sFormSection>

      <K8sFormSection title={translate('Load Balancer Defaults')} topSeparator>
        <SelectGroup
          space={5}
          name={`${name}.load_balancer_mode`}
          label={translate('Load balancer nodes')}
          description={translate(
            'Whether clusters get dedicated load balancer nodes. Defaults to always included.',
          )}
          options={getLoadBalancerModeOptions()}
          placeholder={translate('Always included')}
          isClearable={false}
          simpleValue
        />
        {loadBalancerMode !== 'disabled' && (
          <>
            <Row>
              <Col md={6}>
                <NumberGroup
                  space={5}
                  label={translate('vCPUs per Load Balancer')}
                  tooltipEnd
                  help={translate(
                    'Number of vCPUs allocated to each load balancer node',
                  )}
                  name={`${name}.default_lb_vcpus`}
                  type="number"
                  min="1"
                  max="16"
                  parse={(value) => (value ? parseInt(value, 10) : undefined)}
                />
              </Col>
              <Col md={6}>
                <NumberGroup
                  space={5}
                  label={translate('RAM per Load Balancer (GB)')}
                  tooltipEnd
                  help={translate(
                    'Amount of RAM in GB allocated to each load balancer node',
                  )}
                  name={`${name}.default_lb_ram_gb`}
                  type="number"
                  min="1"
                  max="64"
                  parse={(value) => (value ? parseInt(value, 10) : undefined)}
                />
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <NumberGroup
                  space={5}
                  label={translate('System Disk per Load Balancer (GB)')}
                  tooltipEnd
                  help={translate(
                    'Size of system disk in GB for each load balancer node',
                  )}
                  name={`${name}.default_lb_system_disk_gb`}
                  type="number"
                  min="1"
                  max="500"
                  parse={(value) => (value ? parseInt(value, 10) : undefined)}
                />
              </Col>
              <Col md={6}>
                <NumberGroup
                  space={5}
                  label={translate('Data Disk per Load Balancer (GB)')}
                  tooltipEnd
                  help={translate(
                    'Size of data disk in GB for each load balancer node',
                  )}
                  name={`${name}.default_lb_logs_disk_gb`}
                  type="number"
                  min="1"
                  max="1000"
                  parse={(value) => (value ? parseInt(value, 10) : undefined)}
                />
              </Col>
            </Row>
          </>
        )}
      </K8sFormSection>

      <K8sFormSection
        title={translate('Worker Node Requirements')}
        topSeparator
      >
        <Row>
          <Col md={6}>
            <NumberGroup
              space={5}
              label={translate('Minimal vCPUs per Worker')}
              tooltipEnd
              help={translate(
                'Minimum number of vCPUs required for worker nodes when selecting flavors',
              )}
              name={`${name}.minimal_worker_vcpus`}
              type="number"
              min="1"
              max="16"
              parse={(value) => (value ? parseInt(value, 10) : undefined)}
            />
          </Col>
          <Col md={6}>
            <NumberGroup
              space={5}
              label={translate('Minimal RAM per Worker (GB)')}
              tooltipEnd
              help={translate(
                'Minimum amount of RAM in GB required for worker nodes when selecting flavors',
              )}
              name={`${name}.minimal_worker_ram_gb`}
              type="number"
              min="1"
              max="64"
              parse={(value) => (value ? parseInt(value, 10) : undefined)}
            />
          </Col>
        </Row>
      </K8sFormSection>

      <K8sFormSection title={translate('Default Volume Sizes')} topSeparator>
        <Row>
          <Col md={4}>
            <NumberGroup
              space={5}
              label={translate('Worker Data Disk (GB)')}
              tooltipEnd
              help={translate('Default size of data disk for worker nodes')}
              name={`${name}.default_worker_data_disk_gb`}
              type="number"
              min="1"
              max="10000"
              parse={(value) => (value ? parseInt(value, 10) : undefined)}
            />
          </Col>
          <Col md={4}>
            <NumberGroup
              space={5}
              label={translate('Storage Data Disk (GB)')}
              tooltipEnd
              help={translate('Default size of data disk for storage nodes')}
              name={`${name}.default_storage_data_disk_gb`}
              type="number"
              min="1"
              max="10000"
              parse={(value) => (value ? parseInt(value, 10) : undefined)}
            />
          </Col>
          <Col md={4}>
            <NumberGroup
              space={5}
              label={translate('Storage SAN Disk (GB)')}
              tooltipEnd
              help={translate(
                'Default size of virtual SAN disk for storage nodes',
              )}
              name={`${name}.default_storage_san_disk_gb`}
              type="number"
              min="1"
              max="50000"
              parse={(value) => (value ? parseInt(value, 10) : undefined)}
            />
          </Col>
        </Row>
      </K8sFormSection>

      <K8sFormSection
        title={translate('Kubernetes Version Configuration')}
        topSeparator
      >
        <Row>
          <Col md={12}>
            <StringGroup
              space={5}
              required
              label={translate('Available Kubernetes Versions')}
              tooltipEnd
              help={translate(
                'Enter comma-separated list of Kubernetes versions (e.g., 1.32.0,1.33.0,1.34.0). This controls which versions users can select when creating clusters.',
              )}
              validate={(value) =>
                required(value) &&
                translate(
                  'Users cannot create clusters until Kubernetes versions are configured.',
                )
              }
              name={`${name}.available_kubernetes_versions`}
              placeholder="1.32.0,1.33.0,1.34.0"
            />
          </Col>
        </Row>
      </K8sFormSection>
    </>
  );
};
