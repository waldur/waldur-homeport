import {
  CheckIcon,
  InfoIcon,
  ShieldCheckIcon,
  PlusIcon,
  XIcon,
} from '@phosphor-icons/react';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Row, Col, Form, Alert, Button } from 'react-bootstrap';
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
  DatacenterNodeGroup,
  LocalOpenStackFlavor,
  K8sDefaultConfiguration,
  getAvailableKubernetesVersions,
  validateK8sConfiguration,
  isK8sConfigurationComplete,
  createDefaultClusterConfig,
  getDefaultDatacenterDiskConfig,
  getDefaultStorageDiskConfig,
} from './multi-datacenter-k8s-types';

interface SingleDatacenterK8sConfigurationFormProps extends FormField {
  field: {
    type?: string;
    label?: string;
    help_text?: string;
    required?: boolean;
  };
}

interface NodeGroupCardProps {
  nodeGroup: DatacenterNodeGroup;
  offeringUuid?: string;
  onUpdate: (updates: Partial<DatacenterNodeGroup>) => void;
  onRemove: () => void;
  canRemove: boolean;
  defaultConfigs?: K8sDefaultConfiguration;
}

const NodeGroupCard: React.FC<NodeGroupCardProps> = ({
  nodeGroup,
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
              {translate('{type} Node Group', {
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
                datacenterName="Single Datacenter"
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

  const handleKubernetesVersionChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setClusterConfig({
      ...clusterConfig,
      kubernetes_version: event.target.value,
    });
  };

  const handleInfrastructureChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const selectedUuid = event.target.value;
    const selectedInfra = availableInfrastructures.find(
      (infra) => infra.uuid === selectedUuid,
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

  const handleLonghornChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setClusterConfig({
      ...clusterConfig,
      install_longhorn: event.target.checked,
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

  // Check for configuration warnings
  const configurationWarnings = validateK8sConfiguration(defaultConfigs);
  const isConfigComplete = isK8sConfigurationComplete(defaultConfigs);

  // Get the single datacenter
  const datacenter = clusterConfig.datacenters[0];

  return (
    <div className="single-datacenter-k8s-configuration">
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
          <Row>
            <Col md={6}>
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
                  {getAvailableKubernetesVersions(defaultConfigs).map(
                    (version) => (
                      <option key={version.value} value={version.value}>
                        {version.label}
                      </option>
                    ),
                  )}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
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
                          'Automatically install Longhorn for cloud-native distributed block storage.',
                        )}
                      </div>
                    </div>
                  }
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* OpenStack Infrastructure Selection */}
      <Card className="mb-4">
        <Card.Header>
          <h6 className="mb-0">
            <CheckIcon className="me-2" size={16} weight="bold" />
            {translate('Infrastructure Configuration')}
          </h6>
        </Card.Header>
        <Card.Body>
          <Form.Group className="mb-4">
            <Form.Label>
              {translate('OpenStack Infrastructure')}{' '}
              <span className="text-danger">*</span>
            </Form.Label>

            {loadingInfrastructures ? (
              <Alert variant="info">
                {translate('Loading available infrastructures...')}
              </Alert>
            ) : (
              <Form.Select
                value={datacenter?.openstack_infrastructure?.uuid || ''}
                onChange={handleInfrastructureChange}
              >
                <option value="">
                  {translate('Select OpenStack infrastructure...')}
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
                'Choose the OpenStack tenant that will provide infrastructure for this cluster',
              )}
            </Form.Text>
          </Form.Group>

          <Alert variant="info">
            <div>
              <strong>{translate('Single Datacenter Deployment')}</strong>
            </div>
            <div className="text-muted mt-2">
              {translate(
                'This cluster will be deployed in one datacenter with 3 controller nodes and 1 load balancer for high availability within the datacenter.',
              )}
            </div>
          </Alert>
        </Card.Body>
      </Card>

      {/* Node Groups Configuration */}
      {datacenter?.openstack_infrastructure && (
        <Card className="mb-4">
          <Card.Header>
            <h6 className="mb-0">
              <InfoIcon className="me-2" size={16} weight="bold" />
              {translate('Node Groups Configuration')}
            </h6>
            <div className="card-toolbar">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={addNodeGroup}
              >
                <PlusIcon size={14} className="me-1" weight="bold" />
                {translate('Add Node Group')}
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            <p className="text-muted mb-4">
              {translate(
                'Configure worker and storage node groups. At least one worker group is required.',
              )}
            </p>

            {datacenter.node_groups.length === 0 && (
              <Alert variant="warning">
                {translate(
                  'Add at least one worker group to configure the cluster',
                )}
              </Alert>
            )}

            {datacenter.node_groups.map((group, groupIndex) => (
              <NodeGroupCard
                key={group.id}
                nodeGroup={group}
                offeringUuid={datacenter.openstack_infrastructure?.uuid}
                onUpdate={(updates) => updateNodeGroup(groupIndex, updates)}
                onRemove={() => removeNodeGroup(groupIndex)}
                canRemove={datacenter.node_groups.length > 1}
                defaultConfigs={defaultConfigs}
              />
            ))}
          </Card.Body>
        </Card>
      )}

      {/* Security Configuration */}
      <Card className="mb-4">
        <Card.Header>
          <h6 className="mb-0">
            <ShieldCheckIcon className="me-2" size={16} weight="bold" />
            {translate('Security Configuration')}
          </h6>
        </Card.Header>
        <Card.Body>
          <p className="text-muted mb-4">
            {translate(
              'Configure network security rules for cluster access and administration',
            )}
          </p>

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
        </Card.Body>
      </Card>
    </div>
  );
};
