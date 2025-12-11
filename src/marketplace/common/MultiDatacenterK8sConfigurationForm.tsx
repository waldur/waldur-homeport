import {
  PlusIcon,
  XIcon,
  InfoIcon,
  CalendarBlankIcon,
  CheckIcon,
  ShieldCheckIcon,
} from '@phosphor-icons/react';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Button, Row, Col, Form, Alert, Table } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { marketplacePublicOfferingsList } from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { FormField } from '@waldur/form/types';
import { translate } from '@waldur/i18n';
import { getCustomer } from '@waldur/workspace/selectors';

import { K8sFlavorSelectionTable } from './K8sFlavorSelectionTable';
import K8sSecurityRulesField from './K8sSecurityRulesField';
import {
  MultiDatacenterK8sClusterConfig,
  DatacenterConfiguration,
  DatacenterNodeGroup,
  LocalOpenStackFlavor,
  createDefaultClusterConfig,
  calculateDatacenterResources,
  calculateTotalClusterResources,
  validateMultiDatacenterConfiguration,
  getControllerNodesCount,
  getLoadBalancerNodesCount,
  getDefaultDatacenterDiskConfig,
  getDefaultStorageDiskConfig,
  K8sDefaultConfiguration,
  getAvailableKubernetesVersions,
  validateK8sConfiguration,
  isK8sConfigurationComplete,
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
  const handleInfrastructureChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const selectedUuid = event.target.value;
    const selectedInfra = availableInfrastructures.find(
      (infra) => infra.uuid === selectedUuid,
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
    <Card className="mb-4">
      <Card.Header className="bg-light">
        <Row className="align-items-center">
          <Col>
            <h5 className="mb-0">
              <CalendarBlankIcon className="me-2" size={20} weight="bold" />
              {datacenter.name}
            </h5>
          </Col>
          <Col xs="auto">
            <Badge variant="default" outline>
              {dcResources.totalNodes} nodes, {dcResources.totalVCpus} vCPUs,{' '}
              {dcResources.totalRam}GB RAM
            </Badge>
          </Col>
        </Row>
      </Card.Header>

      <Card.Body>
        {/* OpenStack Infrastructure Selection */}
        <Form.Group className="mb-4">
          <Form.Label>
            <CheckIcon className="me-2" size={16} weight="bold" />
            {translate('OpenStack Infrastructure')}
            <span className="text-danger ms-1">*</span>
          </Form.Label>

          {loadingInfrastructures ? (
            <Alert variant="info">
              {translate('Loading available infrastructures...')}
            </Alert>
          ) : (
            <Form.Select
              value={datacenter.openstack_infrastructure?.uuid || ''}
              onChange={handleInfrastructureChange}
            >
              <option value="">
                {translate('Select OpenStack infrastructure for {datacenter}', {
                  datacenter: datacenter.name,
                })}
              </option>
              {availableInfrastructures.map((infra) => (
                <option key={infra.uuid} value={infra.uuid}>
                  {infra.name} ({infra.customer_name})
                </option>
              ))}
            </Form.Select>
          )}

          <Form.Text className="text-muted">
            {translate(
              'Choose the OpenStack tenant that will provide infrastructure for this datacenter',
            )}
          </Form.Text>
        </Form.Group>

        {/* Controller Nodes Information */}
        {controllerNodes > 0 && (
          <Alert variant="info" className="mb-3">
            <Row className="align-items-center">
              <Col>
                <h6 className="mb-1">
                  <CheckIcon className="me-2" size={16} weight="bold" />
                  {translate('Controller Nodes (Mandatory)')}
                </h6>
                <small className="text-muted">
                  {translate(
                    'Kubernetes control plane components (API server, etcd, scheduler)',
                  )}
                </small>
              </Col>
              <Col xs="auto">
                <div className="text-end">
                  <Badge variant="purple" outline className="me-2">
                    {controllerNodes}{' '}
                    {controllerNodes === 1 ? 'controller' : 'controllers'}
                  </Badge>
                  <small className="text-muted d-block">
                    {controllerNodes *
                      (defaultConfigs?.default_controller_vcpus || 2)}{' '}
                    vCPU,{' '}
                    {controllerNodes *
                      (defaultConfigs?.default_controller_ram_gb || 4)}
                    GB RAM
                  </small>
                  <small className="text-muted d-block">
                    {controllerNodes *
                      (defaultConfigs?.default_controller_system_disk_gb || 20)}
                    GB system +{' '}
                    {controllerNodes *
                      (defaultConfigs?.default_controller_etcd_disk_gb || 50)}
                    GB etcd
                  </small>
                </div>
              </Col>
            </Row>
          </Alert>
        )}

        {/* Load Balancer Nodes Information */}
        {loadBalancerNodes > 0 && (
          <Alert variant="success" className="mb-4">
            <Row className="align-items-center">
              <Col>
                <h6 className="mb-1">
                  <CheckIcon className="me-2" size={16} weight="bold" />
                  {translate('Load Balancer Nodes (Mandatory)')}
                </h6>
                <small className="text-muted">
                  {translate(
                    'External load balancers for ingress and service exposure',
                  )}
                </small>
              </Col>
              <Col xs="auto">
                <div className="text-end">
                  <Badge variant="success" outline className="me-2">
                    {loadBalancerNodes} load{' '}
                    {loadBalancerNodes === 1 ? 'balancer' : 'balancers'}
                  </Badge>
                  <small className="text-muted d-block">
                    {loadBalancerNodes *
                      (defaultConfigs?.default_lb_vcpus || 2)}{' '}
                    vCPU,{' '}
                    {loadBalancerNodes *
                      (defaultConfigs?.default_lb_ram_gb || 8)}
                    GB RAM
                  </small>
                  <small className="text-muted d-block">
                    {loadBalancerNodes *
                      (defaultConfigs?.default_lb_system_disk_gb || 20)}
                    GB system +{' '}
                    {loadBalancerNodes *
                      (defaultConfigs?.default_lb_logs_disk_gb || 20)}
                    GB logs
                  </small>
                </div>
              </Col>
            </Row>
          </Alert>
        )}

        {/* Node Groups Configuration */}
        {datacenter.openstack_infrastructure && (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">
                <InfoIcon className="me-2" size={16} weight="bold" />
                {translate('Node Groups')}
              </h6>
              <div>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={addNodeGroup}
                >
                  <PlusIcon size={14} className="me-1" weight="bold" />
                  {translate('Add Node Group')}
                </Button>
              </div>
            </div>

            {datacenter.node_groups.length === 0 && (
              <Alert variant="warning">
                {translate(
                  'Add at least one worker group to configure this datacenter',
                )}
              </Alert>
            )}

            {datacenter.node_groups.map((group, groupIndex) => (
              <NodeGroupCard
                key={group.id}
                nodeGroup={group}
                datacenterName={datacenter.name}
                offeringUuid={datacenter.openstack_infrastructure?.uuid}
                onUpdate={(updates) => updateNodeGroup(groupIndex, updates)}
                onRemove={() => removeNodeGroup(groupIndex)}
                canRemove={datacenter.node_groups.length > 1}
                defaultConfigs={defaultConfigs}
              />
            ))}

            {/* Datacenter Resource Summary */}
            <Card className="bg-light mt-3">
              <Card.Body>
                <h6 className="mb-3">
                  {translate('{datacenter} Resource Summary', {
                    datacenter: datacenter.name,
                  })}
                </h6>

                {/* Node Type Breakdown */}
                <Row className="mb-3">
                  <Col md={2}>
                    <div className="text-center">
                      <Badge variant="purple" outline className="mb-1">
                        {dcResources.controllerNodes}
                      </Badge>
                      <div>
                        <small className="text-muted">Controllers</small>
                      </div>
                    </div>
                  </Col>
                  <Col md={2}>
                    <div className="text-center">
                      <Badge variant="success" outline className="mb-1">
                        {dcResources.loadBalancerNodes}
                      </Badge>
                      <div>
                        <small className="text-muted">Load Balancers</small>
                      </div>
                    </div>
                  </Col>
                  <Col md={2}>
                    <div className="text-center">
                      <Badge bg="primary" className="mb-1">
                        {dcResources.workerNodes}
                      </Badge>
                      <div>
                        <small className="text-muted">Workers</small>
                      </div>
                    </div>
                  </Col>
                  <Col md={2}>
                    <div className="text-center">
                      <Badge variant="warning" outline className="mb-1">
                        {dcResources.storageNodes}
                      </Badge>
                      <div>
                        <small className="text-muted">Storage</small>
                      </div>
                    </div>
                  </Col>
                  <Col md={2}>
                    <div className="text-center">
                      <Badge variant="default" outline className="mb-1">
                        {dcResources.totalNodes}
                      </Badge>
                      <div>
                        <small className="text-muted">Total Nodes</small>
                      </div>
                    </div>
                  </Col>
                  <Col md={2} />
                </Row>

                {/* Resource Summary */}
                <Row>
                  <Col md={3}>
                    <div className="text-center">
                      <div>
                        <strong>{dcResources.totalVCpus}</strong>
                      </div>
                      <small className="text-muted">Total vCPUs</small>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center">
                      <div>
                        <strong>{dcResources.totalRam}GB</strong>
                      </div>
                      <small className="text-muted">Total RAM</small>
                    </div>
                  </Col>
                  <Col md={2}>
                    <div className="text-center">
                      <div>
                        <strong>{dcResources.totalSystemStorage}GB</strong>
                      </div>
                      <small className="text-muted">System Storage</small>
                    </div>
                  </Col>
                  <Col md={2}>
                    <div className="text-center">
                      <div>
                        <strong>{dcResources.totalDataStorage}GB</strong>
                      </div>
                      <small className="text-muted">Data + etcd</small>
                    </div>
                  </Col>
                  <Col md={2}>
                    <div className="text-center">
                      <div>
                        <strong>{dcResources.totalSanStorage}GB</strong>
                      </div>
                      <small className="text-muted">SAN Storage</small>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

interface NodeGroupCardProps {
  nodeGroup: DatacenterNodeGroup;
  datacenterName: string;
  offeringUuid?: string;
  onUpdate: (updates: Partial<DatacenterNodeGroup>) => void;
  onRemove: () => void;
  canRemove: boolean;
  defaultConfigs?: K8sDefaultConfiguration;
}

const NodeGroupCard: React.FC<NodeGroupCardProps> = ({
  nodeGroup,
  datacenterName,
  offeringUuid,
  onUpdate,
  onRemove,
  canRemove,
  defaultConfigs,
}) => {
  const isStorageGroup = nodeGroup.type === 'storage';
  const selectedFlavor = nodeGroup.openstack_flavor;

  const handleFlavorSelect = (flavor: LocalOpenStackFlavor) => {
    onUpdate({ openstack_flavor: flavor });
  };

  const handleProfileChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = event.target.value as 'worker' | 'storage';
    const newDiskConfig =
      newType === 'storage'
        ? getDefaultStorageDiskConfig(defaultConfigs)
        : getDefaultDatacenterDiskConfig(defaultConfigs);

    onUpdate({
      type: newType,
      disk_config: newDiskConfig,
    });
  };

  const handleNodeCountChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const nodeCount = Math.max(1, parseInt(event.target.value) || 1);
    onUpdate({ node_count: nodeCount });
  };

  const handleDiskConfigChange = (
    field: keyof DatacenterNodeGroup['disk_config'],
    value: number,
  ) => {
    onUpdate({
      disk_config: {
        ...nodeGroup.disk_config,
        [field]: Math.max(field === 'system_disk_size_gb' ? 20 : 10, value),
      },
    });
  };

  return (
    <Card className={`mb-3 border-${isStorageGroup ? 'warning' : 'primary'}`}>
      <Card.Header
        className={`bg-${isStorageGroup ? 'warning' : 'primary'} bg-opacity-10`}
      >
        <Row className="align-items-center">
          <Col>
            <h6 className="mb-0">
              <Badge
                bg={isStorageGroup ? 'warning' : 'primary'}
                className="me-2"
              >
                {nodeGroup.type.toUpperCase()}
              </Badge>
              {translate('{datacenter} {type} Group', {
                datacenter: datacenterName,
                type: nodeGroup.type,
              })}
            </h6>
          </Col>
          <Col xs="auto">
            {selectedFlavor && (
              <div className="text-end">
                <small className="text-muted d-block">
                  <CheckIcon size={12} className="me-1" weight="bold" />
                  {selectedFlavor.vcpus} vCPU
                </small>
                <small className="text-muted d-block">
                  <InfoIcon size={12} className="me-1" weight="bold" />
                  {Math.round(selectedFlavor.ram / 1024)}GB RAM
                </small>
              </div>
            )}
            {canRemove && (
              <Button
                variant="danger"
                size="sm"
                onClick={onRemove}
                className="ms-2"
              >
                <XIcon size={14} weight="bold" />
              </Button>
            )}
          </Col>
        </Row>
      </Card.Header>

      <Card.Body>
        <Row>
          {/* Node Group Profile Selection */}
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>
                {translate('Node Group Profile')}{' '}
                <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                value={nodeGroup.type}
                onChange={handleProfileChange}
              >
                <option value="worker">
                  {translate('Worker - Application workloads')}
                </option>
                <option value="storage">
                  {translate('Storage - Distributed storage and persistence')}
                </option>
              </Form.Select>
              <Form.Text className="text-muted">
                {nodeGroup.type === 'worker'
                  ? translate('Runs application pods and services')
                  : translate('Provides distributed storage for the cluster')}
              </Form.Text>
            </Form.Group>
          </Col>

          {/* OpenStack Flavor Selection */}
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>
                {translate('OpenStack Flavor')}{' '}
                <span className="text-danger">*</span>
              </Form.Label>
              <K8sFlavorSelectionTable
                offeringUuid={offeringUuid}
                selectedFlavor={selectedFlavor}
                onFlavorSelect={handleFlavorSelect}
                nodeGroupType={nodeGroup.type}
                datacenterName={datacenterName}
                minimalSettings={defaultConfigs}
              />
            </Form.Group>
          </Col>

          {/* Node Count */}
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>
                {translate('Number of Nodes')}{' '}
                <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="number"
                min="1"
                max="20"
                value={nodeGroup.node_count}
                onChange={handleNodeCountChange}
              />
              <Form.Text className="text-muted">
                {translate('Number of {type} nodes in this group', {
                  type: nodeGroup.type,
                })}
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>

        {/* Disk Configuration */}
        <Row>
          <Col md={isStorageGroup ? 3 : 4}>
            <Form.Group className="mb-3">
              <Form.Label>
                {translate('System Disk')}
                <Badge variant="default" outline className="ms-2">
                  Pre-configured
                </Badge>
              </Form.Label>
              <Form.Control
                type="number"
                value={nodeGroup.disk_config.system_disk_size_gb}
                disabled
                readOnly
              />
              <Form.Text className="text-muted">
                {translate('Operating system and Kubernetes components')}
              </Form.Text>
            </Form.Group>
          </Col>

          <Col md={isStorageGroup ? 3 : 4}>
            <Form.Group className="mb-3">
              <Form.Label>
                {translate('Data Disk')} <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="number"
                min="10"
                max="10000"
                value={nodeGroup.disk_config.data_disk_size_gb}
                onChange={(e) =>
                  handleDiskConfigChange(
                    'data_disk_size_gb',
                    parseInt(e.target.value) || 10,
                  )
                }
              />
              <Form.Text className="text-muted">
                {nodeGroup.type === 'worker'
                  ? translate('Application data and container storage')
                  : translate('Local storage cache and temporary data')}
              </Form.Text>
            </Form.Group>
          </Col>

          {/* Virtual SAN Disk (only for storage groups) */}
          {isStorageGroup && (
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>
                  {translate('Virtual SAN Disk')}{' '}
                  <span className="text-danger">*</span>
                  <Badge variant="warning" outline className="ms-2">
                    Storage Only
                  </Badge>
                </Form.Label>
                <Form.Control
                  type="number"
                  min="100"
                  max="50000"
                  value={nodeGroup.disk_config.virtual_san_disk_size_gb || 500}
                  onChange={(e) =>
                    handleDiskConfigChange(
                      'virtual_san_disk_size_gb',
                      parseInt(e.target.value) || 500,
                    )
                  }
                />
                <Form.Text className="text-muted">
                  {translate(
                    'Distributed storage pool for cluster persistence',
                  )}
                </Form.Text>
              </Form.Group>
            </Col>
          )}

          {/* Spacer for worker groups */}
          {!isStorageGroup && <Col md={4} />}
        </Row>

        {/* Flavor Details */}
        {selectedFlavor && (
          <Alert variant="light" className="mt-3">
            <Row>
              <Col md={3}>
                <div className="text-center">
                  <CheckIcon size={24} className="text-primary" weight="bold" />
                  <div>
                    <strong>{selectedFlavor.vcpus}</strong>
                  </div>
                  <small className="text-muted">vCPUs</small>
                </div>
              </Col>
              <Col md={3}>
                <div className="text-center">
                  <InfoIcon size={24} className="text-info" weight="bold" />
                  <div>
                    <strong>{Math.round(selectedFlavor.ram / 1024)}</strong>
                  </div>
                  <small className="text-muted">GB RAM</small>
                </div>
              </Col>
              <Col md={3}>
                <div className="text-center">
                  <InfoIcon size={24} className="text-warning" weight="bold" />
                  <div>
                    <strong>{selectedFlavor.disk}</strong>
                  </div>
                  <small className="text-muted">GB Root Disk</small>
                </div>
              </Col>
              <Col md={3}>
                <div className="text-center">
                  <CheckIcon size={24} className="text-success" weight="bold" />
                  <div>
                    <strong>{selectedFlavor.name}</strong>
                  </div>
                  <small className="text-muted">Flavor</small>
                </div>
              </Col>
            </Row>
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export const MultiDatacenterK8sConfigurationForm: React.FC<
  MultiDatacenterK8sConfigurationFormProps
> = ({ field, input }) => {
  const customer = useSelector(getCustomer);

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

  const handleKubernetesVersionChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setClusterConfig({
      ...clusterConfig,
      kubernetes_version: event.target.value,
    });
  };

  // Topology is now determined by field type, no manual selection needed

  const handleLonghornChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setClusterConfig({
      ...clusterConfig,
      install_longhorn: event.target.checked,
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
  const validationErrors = validateMultiDatacenterConfiguration(clusterConfig);

  // Check for configuration warnings
  const configurationWarnings = validateK8sConfiguration(defaultConfigs);
  const isConfigComplete = isK8sConfigurationComplete(defaultConfigs);

  return (
    <div className="multi-datacenter-k8s-configuration">
      {field.help_text && (
        <Alert variant="info" className="mb-4">
          <InfoIcon className="me-2" size={16} weight="bold" />
          {field.help_text}
        </Alert>
      )}

      {/* Configuration Warnings */}
      {configurationWarnings.length > 0 && (
        <Alert variant="warning" className="mb-4">
          <InfoIcon className="me-2" size={16} weight="bold" />
          <strong>{translate('Configuration Incomplete')}</strong>
          <ul className="mb-0 mt-2">
            {configurationWarnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Kubernetes Version Selection */}
      <Card className="mb-4">
        <Card.Header>
          <h6 className="mb-0">
            <CheckIcon className="me-2" size={16} weight="bold" />
            {translate('Kubernetes Configuration')}
          </h6>
        </Card.Header>
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label>
              {translate('Kubernetes Version')}{' '}
              <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              value={clusterConfig.kubernetes_version}
              onChange={handleKubernetesVersionChange}
              disabled={!isConfigComplete}
            >
              <option value="">
                {isConfigComplete
                  ? translate('Select Kubernetes version...')
                  : translate(
                      'Configuration incomplete - please configure offering settings',
                    )}
              </option>
              {getAvailableKubernetesVersions(defaultConfigs).map((version) => (
                <option key={version.value} value={version.value}>
                  {version.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Longhorn Storage Option */}
          <Form.Group className="mb-0">
            <Form.Check
              type="checkbox"
              id="install-longhorn"
              checked={clusterConfig.install_longhorn || false}
              onChange={handleLonghornChange}
              label={
                <div>
                  <strong>
                    {translate('Install Longhorn Distributed Storage')}
                  </strong>
                  <div className="text-muted small mt-1">
                    {translate(
                      'Automatically install Longhorn for cloud-native distributed block storage. Requires at least 3 storage nodes across all datacenters.',
                    )}
                  </div>
                </div>
              }
              className="mt-3"
            />
          </Form.Group>
        </Card.Body>
      </Card>

      {/* Datacenter Configuration */}
      {/* Topology is determined by field type: {topology} */}
      <Card className="mb-4">
        <Card.Header>
          <h6 className="mb-0">
            <CalendarBlankIcon className="me-2" size={16} weight="bold" />
            {topology === '1-datacenter'
              ? translate('Single Datacenter Configuration')
              : translate('Multi-Datacenter Configuration')}
          </h6>
        </Card.Header>
        <Card.Body>
          <div className="text-muted mb-3">
            {topology === '1-datacenter'
              ? translate(
                  'Deploy cluster in one datacenter for simplicity and cost optimization',
                )
              : translate(
                  'Deploy cluster across three datacenters for high availability and disaster recovery',
                )}
          </div>
        </Card.Body>
      </Card>

      {/* Datacenter Configuration Details */}
      <div className="mb-3">
        <h5>
          <CalendarBlankIcon className="me-2" size={20} weight="bold" />
          {translate('Datacenter Configuration')}
        </h5>
        <p className="text-muted">
          {translate(
            'Configure OpenStack infrastructure and node groups for each datacenter',
          )}
        </p>
      </div>

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

      {/* Total Cluster Resources */}
      <Card className="mb-4 border-success">
        <Card.Header className="bg-success bg-opacity-10">
          <h6 className="mb-0">
            <CheckIcon className="me-2" size={16} weight="bold" />
            {translate('Total Cluster Resources')}
          </h6>
        </Card.Header>
        <Card.Body>
          <Table responsive>
            <thead>
              <tr>
                <th>{translate('Controllers')}</th>
                <th>{translate('Load Balancers')}</th>
                <th>{translate('Workers')}</th>
                <th>{translate('Storage')}</th>
                <th>{translate('Total Nodes')}</th>
                <th>{translate('Total vCPUs')}</th>
                <th>{translate('Total RAM')}</th>
                <th>{translate('System + etcd')}</th>
                <th>{translate('Data + logs')}</th>
                <th>{translate('SAN Storage')}</th>
                <th>{translate('Datacenters')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Badge variant="purple" outline>
                    {totalResources.totalControllerNodes}
                  </Badge>
                  <br />
                  <small className="text-muted">
                    {topology === '1-datacenter' ? '3 in DC1' : '1 per DC'}
                  </small>
                </td>
                <td>
                  <Badge variant="success" outline>
                    {totalResources.totalLoadBalancerNodes}
                  </Badge>
                  <br />
                  <small className="text-muted">
                    {topology === '1-datacenter' ? '1 in DC1' : '1 per DC'}
                  </small>
                </td>
                <td>
                  <Badge bg="primary">{totalResources.totalWorkerNodes}</Badge>
                </td>
                <td>
                  <Badge variant="warning" outline>
                    {totalResources.totalStorageNodes}
                  </Badge>
                </td>
                <td>
                  <strong>{totalResources.totalNodes}</strong>
                </td>
                <td>
                  <strong>{totalResources.totalVCpus}</strong> cores
                </td>
                <td>
                  <strong>{totalResources.totalRam}</strong> GB
                </td>
                <td>
                  <strong>{totalResources.totalSystemStorage}</strong> GB
                </td>
                <td>
                  <strong>{totalResources.totalDataStorage}</strong> GB
                </td>
                <td>
                  <strong>{totalResources.totalSanStorage}</strong> GB
                </td>
                <td>
                  <strong>{clusterConfig.datacenters.length}</strong>
                </td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Security Configuration */}
      <div className="mb-4">
        <h5>
          <ShieldCheckIcon className="me-2" size={20} weight="bold" />
          {translate('Security Configuration')}
        </h5>
        <p className="text-muted">
          {translate(
            'Configure network security rules for cluster access and administration',
          )}
        </p>
      </div>

      <div className="mb-4">
        <K8sSecurityRulesField
          field={{
            label: translate('Public Access Rules'),
            help_text: translate(
              'Network rules for public-facing load balancers and ingress controllers',
            ),
            required: false,
            rule_type: 'public_access',
          }}
          input={{
            value: clusterConfig.public_access_rules || [],
            onChange: (rules) =>
              setClusterConfig({
                ...clusterConfig,
                public_access_rules: rules,
              }),
            onBlur: () => {},
            onFocus: () => {},
            onDragStart: () => {},
            onDrop: () => {},
            name: 'public_access_rules',
          }}
          meta={{
            touched: false,
            error: undefined,
            warning: undefined,
            autofilled: false,
            asyncValidating: false,
            dirty: false,
            dispatch: (() => {}) as any,
            form: 'k8s-config',
            initial: undefined,
            invalid: false,
            pristine: true,
            submitting: false,
            submitFailed: false,
            valid: true,
            visited: false,
          }}
        />
      </div>

      <div className="mb-4">
        <K8sSecurityRulesField
          field={{
            label: translate('Administrative Access Rules'),
            help_text: translate(
              'Network rules for cluster administration and monitoring',
            ),
            required: false,
            rule_type: 'administrative_access',
          }}
          input={{
            value: clusterConfig.administrative_access_rules || [],
            onChange: (rules) =>
              setClusterConfig({
                ...clusterConfig,
                administrative_access_rules: rules,
              }),
            onBlur: () => {},
            onFocus: () => {},
            onDragStart: () => {},
            onDrop: () => {},
            name: 'administrative_access_rules',
          }}
          meta={{
            touched: false,
            error: undefined,
            warning: undefined,
            autofilled: false,
            asyncValidating: false,
            dirty: false,
            dispatch: (() => {}) as any,
            form: 'k8s-config',
            initial: undefined,
            invalid: false,
            pristine: true,
            submitting: false,
            submitFailed: false,
            valid: true,
            visited: false,
          }}
        />
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="danger">
          <h6>{translate('Configuration Issues:')}</h6>
          <ul className="mb-0">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}
    </div>
  );
};
