import { PlusCircleIcon } from '@phosphor-icons/react';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { marketplacePublicOfferingsList } from 'waldur-js-client';

import { AccordionCard } from '@/core/AccordionCard';
import { MAX_PAGE_SIZE } from '@/core/api';
import { Badge } from '@/core/Badge';
import { SelectField } from '@/form';
import { FormField } from '@/form/types';
import { translate } from '@/i18n';
import { Field } from '@/resource/summary';
import { CompactActionButton } from '@/table/CompactActionButton';
import { getCustomer } from '@/workspace/selectors';

import { FormGroup } from '../offerings/FormGroup';

import { K8sFormSection } from './K8sFormSection';
import { K8sKubernetesConfigSection } from './K8sKubernetesConfigSection';
import { K8sNodeGroupCard } from './K8sNodeGroupCard';
import { K8sSecurityConfigSection } from './K8sSecurityConfigSection';
import { K8sTotalResourcesCard } from './K8sTotalResourcesCard';
import {
  MultiDatacenterK8sClusterConfig,
  DatacenterNodeGroup,
  K8sDefaultConfiguration,
  createDefaultClusterConfig,
  getDefaultDatacenterDiskConfig,
  calculateTotalClusterResources,
} from './multi-datacenter-k8s-types';

interface SingleDatacenterK8sConfigurationFormProps extends FormField {
  field: {
    type?: string;
    label?: string;
    help_text?: string;
    required?: boolean;
  };
}

export const SingleDatacenterK8sConfigurationForm: React.FC<
  SingleDatacenterK8sConfigurationFormProps
> = ({ field, input }) => {
  const customer = useSelector(getCustomer);

  // Extract default configurations from the field
  const defaultConfigs: K8sDefaultConfiguration | undefined = (field as any)
    ?.default_configs;

  // Single datacenter always uses 1-datacenter topology
  const topology = '1-datacenter' as const;

  // Simple cluster configuration for single datacenter
  const fieldValue = input?.value as MultiDatacenterK8sClusterConfig;
  const defaultClusterConfig = createDefaultClusterConfig(
    topology,
    defaultConfigs,
  );

  const [clusterConfig, setClusterConfig] =
    useState<MultiDatacenterK8sClusterConfig>(
      fieldValue || defaultClusterConfig,
    );

  const [availableInfrastructures, setAvailableInfrastructures] = useState<
    any[]
  >([]);
  const [loadingInfrastructures, setLoadingInfrastructures] = useState(false);

  const loadInfrastructures = useCallback(async () => {
    setLoadingInfrastructures(true);
    try {
      const result = await marketplacePublicOfferingsList({
        query: {
          page_size: MAX_PAGE_SIZE,
          type: ['OpenStack.Tenant'],
          state: ['Active'],
        },
      });
      setAvailableInfrastructures(result.data);
    } catch {
      setAvailableInfrastructures([]);
    } finally {
      setLoadingInfrastructures(false);
    }
  }, [customer?.uuid]);

  useEffect(() => {
    loadInfrastructures();
  }, [loadInfrastructures]);

  // Update parent form when config changes
  const inputRef = useRef(input);
  inputRef.current = input;

  useEffect(() => {
    if (inputRef.current?.onChange) {
      inputRef.current.onChange(clusterConfig);
    }
  }, [clusterConfig]);

  const handleKubernetesVersionChange = (version: string) => {
    setClusterConfig({
      ...clusterConfig,
      kubernetes_version: version,
    });
  };

  const handleInfrastructureChange = (infraUuid: string) => {
    const selectedInfra = availableInfrastructures.find(
      (infra) => infra.uuid === infraUuid,
    );

    // Update the single datacenter's infrastructure
    const updatedDatacenters = clusterConfig.datacenters.map((datacenter) => ({
      ...datacenter,
      openstack_infrastructure: selectedInfra
        ? {
            uuid: selectedInfra.uuid,
            name: selectedInfra.name,
            customer_name: selectedInfra.customer_name,
          }
        : undefined,
    }));

    setClusterConfig({
      ...clusterConfig,
      datacenters: updatedDatacenters,
    });
  };

  const handleLonghornChange = (value: boolean) => {
    setClusterConfig({
      ...clusterConfig,
      install_longhorn: value,
    });
  };

  // Node group management functions
  const addNodeGroup = () => {
    const datacenter = clusterConfig.datacenters[0];
    const newGroup: DatacenterNodeGroup = {
      id: `worker-${datacenter.node_groups.length + 1}`,
      type: 'worker',
      node_count: 3,
      disk_config: getDefaultDatacenterDiskConfig(defaultConfigs),
    };

    const updatedDatacenter = {
      ...datacenter,
      node_groups: [...datacenter.node_groups, newGroup],
    };

    setClusterConfig({
      ...clusterConfig,
      datacenters: [updatedDatacenter],
    });
  };

  const updateNodeGroup = (
    groupIndex: number,
    updates: Partial<DatacenterNodeGroup>,
  ) => {
    const datacenter = clusterConfig.datacenters[0];
    const updatedGroups = datacenter.node_groups.map((group, idx) =>
      idx === groupIndex ? { ...group, ...updates } : group,
    );

    const updatedDatacenter = {
      ...datacenter,
      node_groups: updatedGroups,
    };

    setClusterConfig({
      ...clusterConfig,
      datacenters: [updatedDatacenter],
    });
  };

  const removeNodeGroup = (groupIndex: number) => {
    const datacenter = clusterConfig.datacenters[0];
    const updatedDatacenter = {
      ...datacenter,
      node_groups: datacenter.node_groups.filter(
        (_, idx) => idx !== groupIndex,
      ),
    };

    setClusterConfig({
      ...clusterConfig,
      datacenters: [updatedDatacenter],
    });
  };

  const totalResources = calculateTotalClusterResources(
    clusterConfig,
    defaultConfigs,
  );

  // Get the single datacenter
  const datacenter = clusterConfig.datacenters[0];

  // Controller and load balancer configurations
  const controllerNodes: number = 3;
  const loadBalancerNodes = 1;
  const controllerVcpus = defaultConfigs?.default_controller_vcpus || 2;
  const controllerRam = defaultConfigs?.default_controller_ram_gb || 4;
  const controllerSystemDisk =
    defaultConfigs?.default_controller_system_disk_gb || 20;
  const controllerEtcdDisk =
    defaultConfigs?.default_controller_etcd_disk_gb || 50;
  const lbVcpus = defaultConfigs?.default_lb_vcpus || 2;
  const lbRam = defaultConfigs?.default_lb_ram_gb || 8;
  const lbSystemDisk = defaultConfigs?.default_lb_system_disk_gb || 20;
  const lbLogsDisk = defaultConfigs?.default_lb_logs_disk_gb || 20;

  return (
    <div className="single-datacenter-k8s-configuration">
      <K8sKubernetesConfigSection
        defaultConfigs={defaultConfigs}
        kubernetesVersion={clusterConfig.kubernetes_version}
        onKubernetesVersionChange={handleKubernetesVersionChange}
        installLonghorn={clusterConfig.install_longhorn || false}
        onLonghornChange={handleLonghornChange}
      />

      {/* Datacenter configuration */}
      <K8sFormSection
        title={translate('Datacenter configuration')}
        topSeparator
      >
        <AccordionCard
          title={
            <>
              {translate('Datacenter 1')}
              <Badge variant="default" size="sm" pill outline className="ms-4">
                {totalResources.totalNodes} nodes, {totalResources.totalVCpus}{' '}
                vCPUs, {totalResources.totalRam}GB RAM
              </Badge>
            </>
          }
          secondary
          defaultOpen
          className="mb-5 bg-gray-50"
        >
          {/* OpenStack Infrastructure Selection */}
          <FormGroup
            label={translate('OpenStack infrastructure')}
            description={translate(
              'Choose the OpenStack tenant that will provide infrastructure for this datacenter',
            )}
            required
            space={5}
          >
            <SelectField
              input={{
                value: datacenter?.openstack_infrastructure?.uuid || '',
                onChange: handleInfrastructureChange,
                onBlur: () => {},
              }}
              placeholder={translate('Select OpenStack infrastructure...')}
              simpleValue
              isLoading={loadingInfrastructures}
              isDisabled={loadingInfrastructures}
              options={availableInfrastructures.map((infra) => ({
                value: infra.uuid,
                label: `${infra.name} (${infra.customer_name})`,
              }))}
            />
          </FormGroup>

          {/* Controller Nodes Information */}
          <Field
            label={
              <>
                {translate('Controller nodes (Mandatory)')}:
                <span className="text-quaternary fw-normal d-block">
                  {translate(
                    'Kubernetes control plane components (API server, etcd, scheduler)',
                  )}
                </span>
              </>
            }
            value={
              <>
                <span className="d-block">
                  {controllerNodes}{' '}
                  {controllerNodes === 1 ? 'controller' : 'controllers'}
                </span>
                <span className="d-block">
                  {controllerNodes * controllerVcpus} vCPU,{' '}
                  {controllerNodes * controllerRam}GB RAM
                </span>
                <span className="d-block">
                  {controllerNodes * controllerSystemDisk}GB system +{' '}
                  {controllerNodes * controllerEtcdDisk}GB etcd
                </span>
              </>
            }
            labelCol={4}
            valueCol={7}
            valueClass="offset-sm-1"
            space={5}
          />
          {/* Load Balancer Nodes Information */}
          <Field
            label={
              <>
                {translate('Load balancer nodes (Mandatory)')}:
                <span className="text-quaternary fw-normal d-block">
                  {translate(
                    'External load balancers for ingress and service exposure',
                  )}
                </span>
              </>
            }
            value={
              <>
                <span className="d-block">
                  {loadBalancerNodes} load{' '}
                  {loadBalancerNodes === 1 ? 'balancer' : 'balancers'}
                </span>
                <span className="d-block">
                  {loadBalancerNodes * lbVcpus} vCPU,{' '}
                  {loadBalancerNodes * lbRam}GB RAM
                </span>
                <span className="d-block">
                  {loadBalancerNodes * lbSystemDisk}GB system +{' '}
                  {loadBalancerNodes * lbLogsDisk}GB logs
                </span>
              </>
            }
            labelCol={4}
            valueCol={7}
            valueClass="offset-sm-1"
            space={datacenter?.openstack_infrastructure ? 5 : 0}
          />

          {/* Node Groups Configuration */}
          {datacenter?.openstack_infrastructure && (
            <>
              {/* Add Group Button */}
              <Field
                label={translate('Node groups')}
                value={
                  <CompactActionButton
                    variant="secondary"
                    action={addNodeGroup}
                    iconNode={<PlusCircleIcon weight="bold" />}
                    title={translate('Add node group')}
                  />
                }
                labelCol={4}
                valueCol={7}
                labelClass="col"
                valueClass="offset-sm-1 col-auto"
                space={5}
                className="gy-2 align-items-center"
              />

              {datacenter.node_groups.length === 0 && (
                <Alert variant="warning">
                  {translate(
                    'Add at least one worker group to configure this datacenter',
                  )}
                </Alert>
              )}

              {datacenter.node_groups.map((group, groupIndex) => (
                <K8sNodeGroupCard
                  key={group.id}
                  nodeGroup={group}
                  index={groupIndex}
                  datacenterName={datacenter.name}
                  offeringUuid={datacenter.openstack_infrastructure?.uuid}
                  onUpdate={(updates) => updateNodeGroup(groupIndex, updates)}
                  onRemove={() => removeNodeGroup(groupIndex)}
                  canRemove={datacenter.node_groups.length > 1}
                  defaultConfigs={defaultConfigs}
                />
              ))}
            </>
          )}
        </AccordionCard>

        <K8sTotalResourcesCard
          totalResources={totalResources}
          datacenterCount={1}
        />
      </K8sFormSection>

      <K8sSecurityConfigSection
        publicAccessRules={clusterConfig.public_access_rules || []}
        onPublicAccessRulesChange={(rules) =>
          setClusterConfig({
            ...clusterConfig,
            public_access_rules: rules,
          })
        }
        administrativeAccessRules={
          clusterConfig.administrative_access_rules || []
        }
        onAdministrativeAccessRulesChange={(rules) =>
          setClusterConfig({
            ...clusterConfig,
            administrative_access_rules: rules,
          })
        }
      />
    </div>
  );
};
