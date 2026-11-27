import { PlusCircleIcon } from '@phosphor-icons/react';
import React from 'react';

import {
  AccordionCard,
  AlertItem,
  Badge,
  BaseButton,
  PropertyItem,
  PropertyList,
} from 'waldur-ui';

import { SelectField } from '@/form';
import { FormGroup } from '@/form';
import { translate } from '@/i18n';
import { SimpleTable } from '@/table/SimpleTable';
import { renderFieldOrDash } from '@/table/utils';

import {
  CommonFlavorSource,
  DatacenterConfiguration,
  DatacenterNodeGroup,
  K8sClusterTopology,
  calculateDatacenterResources,
  getControllerNodesCount,
  getLoadBalancerMode,
  getLoadBalancerNodesCount,
  getDefaultDatacenterDiskConfig,
  getNewNodeGroupId,
  K8sDefaultConfiguration,
} from './k8s-types';
import { K8sNodeGroupCard } from './K8sNodeGroupCard';

interface DatacenterCardProps {
  datacenter: DatacenterConfiguration;
  index: number;
  topology: K8sClusterTopology;
  onUpdate?: (updatedDatacenter: DatacenterConfiguration) => void;
  availableInfrastructures?: any[];
  loadingInfrastructures?: boolean;
  defaultConfigs?: K8sDefaultConfiguration;
  loadBalancer: boolean;
  // The provider fixed the site: its name is shown instead of a selector.
  fixedSite?: boolean;
  // On fixed sites: the flavors every site has, the only ones to pick from.
  commonFlavors?: CommonFlavorSource;
  // The node groups are edited on every site at once (fixed sites, several).
  sharedNodeGroups?: boolean;
  // The datacenter whose node groups this one repeats; shown read-only.
  mirrorOf?: string;
  // The node groups are shown but cannot be changed here.
  readOnly?: boolean;
}

const getNodeGroupColumns = () => [
  {
    title: translate('Node group'),
    render: ({ row }: { row: DatacenterNodeGroup & { n: number } }) => (
      <>{translate('Node group #{n}', { n: row.n })}</>
    ),
  },
  {
    title: translate('Profile'),
    render: ({ row }: { row: DatacenterNodeGroup }) => (
      <>{row.type === 'storage' ? translate('Storage') : translate('Worker')}</>
    ),
  },
  {
    title: translate('Flavor'),
    render: ({ row }: { row: DatacenterNodeGroup }) => (
      <>{renderFieldOrDash(row.openstack_flavor?.name)}</>
    ),
  },
  {
    title: translate('Nodes'),
    render: ({ row }: { row: DatacenterNodeGroup }) => <>{row.node_count}</>,
  },
  {
    title: translate('Data disk'),
    render: ({ row }: { row: DatacenterNodeGroup }) => (
      <>{row.disk_config.data_disk_size_gb} GB</>
    ),
  },
];

/**
 * Node groups shown read-only: those of a site that repeats another site's,
 * or of a cluster that cannot be changed here.
 */
const ReadOnlyNodeGroups = ({
  nodeGroups,
  mirrorOf,
}: {
  nodeGroups: DatacenterNodeGroup[];
  mirrorOf?: string;
}) => (
  <>
    <div className="py-2 mb-2">
      <span className="font-medium text-secondary block">
        {translate('Node groups')}
      </span>
      {mirrorOf && (
        <span className="text-quaternary">
          {translate(
            'The same node groups as {datacenter}, with the flavors of this site.',
            { datacenter: mirrorOf },
          )}
        </span>
      )}
    </div>
    <SimpleTable
      columns={getNodeGroupColumns()}
      rows={nodeGroups.map((group, index) => ({ ...group, n: index + 1 }))}
      rowKey="id"
    />
  </>
);

export const K8sDatacenterCard: React.FC<DatacenterCardProps> = ({
  datacenter,
  index,
  topology,
  onUpdate,
  availableInfrastructures = [],
  loadingInfrastructures,
  defaultConfigs,
  loadBalancer,
  fixedSite,
  commonFlavors,
  sharedNodeGroups,
  mirrorOf,
  readOnly,
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
      id: getNewNodeGroupId(datacenter),
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
    loadBalancer,
  );
  const controllerNodes = getControllerNodesCount(topology, index);
  const loadBalancerNodes = getLoadBalancerNodesCount(
    topology,
    index,
    loadBalancer,
  );
  const loadBalancerRequired =
    getLoadBalancerMode(defaultConfigs) === 'required';

  return (
    <AccordionCard
      title={
        <>
          {datacenter.name}
          <Badge
            variant="neutral"
            size="sm"
            shape="pill"
            tone="outline"
            className="ms-3"
          >
            {dcResources.totalNodes} nodes, {dcResources.totalVCpus} vCPUs,{' '}
            {dcResources.totalRam}GB RAM
          </Badge>
        </>
      }
      secondary
      defaultOpen
      className="mb-4 bg-secondary"
    >
      {/* OpenStack Infrastructure Selection; a fixed site is not picked. */}
      {!fixedSite && (
        <FormGroup
          label={translate('OpenStack infrastructure')}
          description={translate(
            'Choose the OpenStack tenant that will provide infrastructure for this datacenter',
          )}
          required
          space={4}
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
      )}

      {/* Controller & Load Balancer Nodes Information */}
      {/* A third of the width for the term, no gap: Field's labelCol={4}.
          A fixed 200px term plus the 24px row gap wrapped the descriptions. */}
      <PropertyList variant="summary" termWidth="33.333%">
        {fixedSite && (
          <PropertyItem
            className="sm:gap-0"
            space={4}
            label={
              <>
                {translate('Site')}:
                <span className="text-quaternary font-normal block">
                  {translate('Set by the service provider')}
                </span>
              </>
            }
            value={datacenter.openstack_infrastructure?.name}
          />
        )}
        {controllerNodes > 0 && (
          <PropertyItem
            className="sm:gap-0"
            space={4}
            label={
              <>
                {translate('Controller nodes (Mandatory)')}:
                <span className="text-quaternary font-normal block">
                  {translate(
                    'Kubernetes control plane components (API server, etcd, scheduler)',
                  )}
                </span>
              </>
            }
            value={
              <>
                <span className="block">
                  {controllerNodes}{' '}
                  {controllerNodes === 1 ? 'controller' : 'controllers'}
                </span>
                <span className="block">
                  {controllerNodes *
                    (defaultConfigs?.default_controller_vcpus || 2)}{' '}
                  vCPU,{' '}
                  {controllerNodes *
                    (defaultConfigs?.default_controller_ram_gb || 4)}
                  GB RAM
                </span>
                <span className="block">
                  {controllerNodes *
                    (defaultConfigs?.default_controller_system_disk_gb || 20)}
                  GB system +{' '}
                  {controllerNodes *
                    (defaultConfigs?.default_controller_etcd_disk_gb || 50)}
                  GB etcd
                </span>
              </>
            }
          />
        )}

        {loadBalancerNodes > 0 && (
          <PropertyItem
            className="sm:gap-0"
            space={datacenter?.openstack_infrastructure ? 4 : 0}
            label={
              <>
                {loadBalancerRequired
                  ? translate('Load balancer nodes (Mandatory)')
                  : translate('Load balancer nodes')}
                :
                <span className="text-quaternary font-normal block">
                  {translate(
                    'External load balancers for ingress and service exposure',
                  )}
                </span>
              </>
            }
            value={
              <>
                <span className="block">
                  {loadBalancerNodes} load{' '}
                  {loadBalancerNodes === 1 ? 'balancer' : 'balancers'}
                </span>
                <span className="block">
                  {loadBalancerNodes * (defaultConfigs?.default_lb_vcpus || 2)}{' '}
                  vCPU,{' '}
                  {loadBalancerNodes * (defaultConfigs?.default_lb_ram_gb || 8)}
                  GB RAM
                </span>
                <span className="block">
                  {loadBalancerNodes *
                    (defaultConfigs?.default_lb_system_disk_gb || 20)}
                  GB system +{' '}
                  {loadBalancerNodes *
                    (defaultConfigs?.default_lb_logs_disk_gb || 20)}
                  GB logs
                </span>
              </>
            }
          />
        )}
      </PropertyList>

      {/* Node Groups Configuration */}
      {datacenter.openstack_infrastructure &&
        (mirrorOf || readOnly ? (
          <ReadOnlyNodeGroups
            nodeGroups={datacenter.node_groups}
            mirrorOf={mirrorOf}
          />
        ) : (
          <>
            {/* Add Group Button */}
            <div className="flex items-center justify-between gap-4 py-2 mb-4">
              <div>
                <span className="font-medium text-secondary block">
                  {sharedNodeGroups
                    ? translate('Node groups (all sites)')
                    : translate('Node groups')}
                </span>
                {sharedNodeGroups && (
                  <span className="text-quaternary">
                    {translate(
                      'Defined once and deployed on every site, each with the flavor of that site.',
                    )}
                  </span>
                )}
              </div>
              <BaseButton
                variant="secondary"
                onClick={addNodeGroup}
                iconNode={<PlusCircleIcon weight="bold" />}
                label={translate('Add node group')}
                size="sm"
              />
            </div>

            {datacenter.node_groups.length === 0 && (
              <AlertItem
                type="floating"
                variant="warning"
                title={translate(
                  'Add at least one worker group to configure this datacenter',
                )}
              />
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
                commonFlavors={commonFlavors}
                allSites={sharedNodeGroups}
              />
            ))}
          </>
        ))}
    </AccordionCard>
  );
};
