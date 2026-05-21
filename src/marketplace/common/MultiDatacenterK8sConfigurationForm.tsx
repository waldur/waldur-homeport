import { PlusCircleIcon } from '@phosphor-icons/react';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-bootstrap';
import { marketplacePublicOfferingsList } from 'waldur-js-client';

import { AccordionCard } from '@/core/AccordionCard';
import { Badge } from '@/core/Badge';
import { SelectField } from '@/form';
import { FormField } from '@/form/types';
import { translate } from '@/i18n';
import { Field } from '@/resource/summary';
import { CompactActionButton } from '@/table/CompactActionButton';
import { useCustomer } from '@/workspace/hooks';

import { FormGroup } from '../offerings/FormGroup';

import { K8sFormSection } from './K8sFormSection';
import { K8sKubernetesConfigSection } from './K8sKubernetesConfigSection';
import { K8sNodeGroupCard } from './K8sNodeGroupCard';
import { K8sSecurityConfigSection } from './K8sSecurityConfigSection';
import { K8sTotalResourcesCard } from './K8sTotalResourcesCard';
import {
  MultiDatacenterK8sClusterConfig,
  DatacenterConfiguration,
  DatacenterNodeGroup,
  createDefaultClusterConfig,
  calculateDatacenterResources,
  calculateTotalClusterResources,
  getControllerNodesCount,
  getLoadBalancerNodesCount,
  getDefaultDatacenterDiskConfig,
  K8sDefaultConfiguration,
} from './multi-datacenter-k8s-types';

interface MultiDatacenterK8sConfigurationFormProps extends FormField {
  field: {
    type?: string;
    label?: string;
    help_text?: string;
    required?: boolean;
  };
}

interface DatacenterCardProps {
  datacenter: DatacenterConfiguration;
  index: number;
  topology: '1-datacenter' | '3-datacenter';
  onUpdate: (updatedDatacenter: DatacenterConfiguration) => void;
  availableInfrastructures: any[];
  loadingInfrastructures: boolean;
  defaultConfigs?: K8sDefaultConfiguration;
}

const DatacenterCard: React.FC<DatacenterCardProps> = ({
  datacenter,
  index,
  topology,
  onUpdate,
  availableInfrastructures,
  loadingInfrastructures,
  defaultConfigs,
}) => {
  const handleInfrastructureChange = (infraUuid: string) => {
    const selectedInfra = availableInfrastructures.find(
      (infra) => infra.uuid === infraUuid,
    );

    onUpdate({
      ...datacenter,
      openstack_infrastructure: selectedInfra
        ? {
            uuid: selectedInfra.uuid,
            name: selectedInfra.name,
            customer_name: selectedInfra.customer_name,
          }
        : undefined,
      // Reset node groups flavors when infrastructure changes
      node_groups: datacenter.node_groups.map((group) => ({
        ...group,
        openstack_flavor: undefined,
      })),
    });
  };

  const addNodeGroup = () => {
    const newGroup: DatacenterNodeGroup = {
      id: `${datacenter.id}-group-${datacenter.node_groups.length + 1}`,
      type: 'worker', // Default to worker, user can change
      node_count: 3,
      disk_config: getDefaultDatacenterDiskConfig(defaultConfigs),
    };

    onUpdate({
      ...datacenter,
      node_groups: [...datacenter.node_groups, newGroup],
    });
  };

  const updateNodeGroup = (
    groupIndex: number,
    updates: Partial<DatacenterNodeGroup>,
  ) => {
    const updatedGroups = datacenter.node_groups.map((group, idx) =>
      idx === groupIndex ? { ...group, ...updates } : group,
    );

    onUpdate({
      ...datacenter,
      node_groups: updatedGroups,
    });
  };

  const removeNodeGroup = (groupIndex: number) => {
    onUpdate({
      ...datacenter,
      node_groups: datacenter.node_groups.filter(
        (_, idx) => idx !== groupIndex,
      ),
    });
  };

  const dcResources = calculateDatacenterResources(
    datacenter,
    topology,
    index,
    defaultConfigs,
  );
  const controllerNodes = getControllerNodesCount(topology, index);
  const loadBalancerNodes = getLoadBalancerNodesCount(topology, index);

  return (
    <AccordionCard
      title={
        <>
          {datacenter.name}
          <Badge variant="default" size="sm" pill outline className="ms-4">
            {dcResources.totalNodes} nodes, {dcResources.totalVCpus} vCPUs,{' '}
            {dcResources.totalRam}GB RAM
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
      {controllerNodes > 0 && (
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
                {controllerNodes *
                  (defaultConfigs?.default_controller_vcpus || 2)}{' '}
                vCPU,{' '}
                {controllerNodes *
                  (defaultConfigs?.default_controller_ram_gb || 4)}
                GB RAM
              </span>
              <span className="d-block">
                {controllerNodes *
                  (defaultConfigs?.default_controller_system_disk_gb || 20)}
                GB system +{' '}
                {controllerNodes *
                  (defaultConfigs?.default_controller_etcd_disk_gb || 50)}
                GB etcd
              </span>
            </>
          }
          labelCol={4}
          valueCol={7}
          valueClass="offset-sm-1"
          space={5}
        />
      )}

      {/* Load Balancer Nodes Information */}
      {loadBalancerNodes > 0 && (
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
                {loadBalancerNodes * (defaultConfigs?.default_lb_vcpus || 2)}{' '}
                vCPU,{' '}
                {loadBalancerNodes * (defaultConfigs?.default_lb_ram_gb || 8)}GB
                RAM
              </span>
              <span className="d-block">
                {loadBalancerNodes *
                  (defaultConfigs?.default_lb_system_disk_gb || 20)}
                GB system +{' '}
                {loadBalancerNodes *
                  (defaultConfigs?.default_lb_logs_disk_gb || 20)}
                GB logs
              </span>
            </>
          }
          labelCol={4}
          valueCol={7}
          valueClass="offset-sm-1"
          space={datacenter?.openstack_infrastructure ? 5 : 0}
        />
      )}

      {/* Node Groups Configuration */}
      {datacenter.openstack_infrastructure && (
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
  );
};

export const MultiDatacenterK8sConfigurationForm: React.FC<
  MultiDatacenterK8sConfigurationFormProps
> = ({ field, input }) => {
  const customer = useCustomer();

  // Extract default configurations from the field (set via EditOptionDialog)
  const defaultConfigs: K8sDefaultConfiguration | undefined = (field as any)
    ?.default_configs;

  // Determine topology based on field type
  const fieldType = field.type;
  const topology: '1-datacenter' | '3-datacenter' =
    fieldType === 'multi_datacenter_k8s_config'
      ? '3-datacenter'
      : '1-datacenter';

  // The value is stored directly as the cluster config, not wrapped in a MultiDatacenterK8sConfigField
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
          page_size: 100,
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

  // Load OpenStack infrastructures only once
  useEffect(() => {
    loadInfrastructures();
  }, [loadInfrastructures]);

  // Update parent form when config changes (memoized to prevent infinite loops)
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

  const handleLonghornChange = (value: boolean) => {
    setClusterConfig({
      ...clusterConfig,
      install_longhorn: value,
    });
  };

  const updateDatacenter = (
    index: number,
    updatedDatacenter: DatacenterConfiguration,
  ) => {
    const updatedDatacenters = clusterConfig.datacenters.map((dc, idx) =>
      idx === index ? updatedDatacenter : dc,
    );

    setClusterConfig({
      ...clusterConfig,
      datacenters: updatedDatacenters,
    });
  };

  const totalResources = calculateTotalClusterResources(
    clusterConfig,
    defaultConfigs,
  );

  return (
    <div className="multi-datacenter-k8s-configuration">
      <K8sKubernetesConfigSection
        defaultConfigs={defaultConfigs}
        kubernetesVersion={clusterConfig.kubernetes_version}
        onKubernetesVersionChange={handleKubernetesVersionChange}
        installLonghorn={clusterConfig.install_longhorn || false}
        onLonghornChange={handleLonghornChange}
        longhornDescription={translate(
          'Automatically install Longhorn for cloud-native distributed block storage. Requires at least 3 storage nodes across all datacenters.',
        )}
      />

      {/* Datacenter configuration */}
      <K8sFormSection
        title={translate('Datacenter configuration')}
        topSeparator
      >
        {clusterConfig.datacenters.map((datacenter, index) => (
          <DatacenterCard
            key={datacenter.id}
            datacenter={datacenter}
            index={index}
            topology={topology}
            onUpdate={(updatedDatacenter) =>
              updateDatacenter(index, updatedDatacenter)
            }
            availableInfrastructures={availableInfrastructures}
            loadingInfrastructures={loadingInfrastructures}
            defaultConfigs={defaultConfigs}
          />
        ))}

        <K8sTotalResourcesCard
          totalResources={totalResources}
          datacenterCount={clusterConfig.datacenters.length}
          controllerTooltip={
            topology === '1-datacenter'
              ? translate('{n} in DC1', { n: 3 })
              : translate('{n} per DC', { n: 1 })
          }
          loadBalancerTooltip={
            topology === '1-datacenter'
              ? translate('{n} in DC1', { n: 1 })
              : translate('{n} per DC', { n: 1 })
          }
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
