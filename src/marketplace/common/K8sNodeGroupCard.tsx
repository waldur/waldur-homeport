import { TrashIcon } from '@phosphor-icons/react';
import { Col, Form, Row, Stack } from 'react-bootstrap';

import { Badge } from '@/core/Badge';
import { NumberField, SelectField } from '@/form';
import { FormGroup } from '@/form';
import { translate } from '@/i18n';
import { CompactActionButton } from '@/table/CompactActionButton';

import { K8sFlavorSelectionTable } from './K8sFlavorSelectionTable';
import {
  DatacenterNodeGroup,
  getDefaultDatacenterDiskConfig,
  getDefaultStorageDiskConfig,
  K8sDefaultConfiguration,
  LocalOpenStackFlavor,
} from './multi-datacenter-k8s-types';

interface NodeGroupCardProps {
  nodeGroup: DatacenterNodeGroup;
  index: number;
  datacenterName: string;
  offeringUuid?: string;
  onUpdate: (updates: Partial<DatacenterNodeGroup>) => void;
  onRemove: () => void;
  canRemove: boolean;
  defaultConfigs?: K8sDefaultConfiguration;
}

const nodeProfileOptions = [
  { label: translate('Worker - Application workloads'), value: 'worker' },
  {
    label: translate('Storage - Distributed storage and persistence'),
    value: 'storage',
  },
];

export const K8sNodeGroupCard: React.FC<NodeGroupCardProps> = ({
  nodeGroup,
  index,
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

  const handleProfileChange = (newType: 'worker' | 'storage') => {
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
    event: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    const v = typeof event === 'object' ? event.target.value : event;
    const nodeCount = Math.max(1, parseInt(v) || 1);
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
    <div className={index > 0 ? 'pt-5 border-top' : undefined}>
      <Stack direction="horizontal" gap={4} className="h-32px mb-5">
        <h6 className="text-secondary mb-0">
          {translate('Node group #{n}', { n: index + 1 })}
        </h6>
        <Badge
          variant={isStorageGroup ? 'warning' : 'default'}
          size="sm"
          pill
          outline
        >
          {nodeGroup.type.toUpperCase()}
        </Badge>
        {canRemove && (
          <CompactActionButton
            variant="danger"
            action={onRemove}
            iconNode={<TrashIcon weight="bold" />}
          />
        )}
      </Stack>

      <Row>
        {/* Node Group Profile Selection */}
        <Col sm={12} md={4}>
          <FormGroup
            label={translate('Node group profile')}
            required
            help={
              nodeGroup.type === 'worker'
                ? translate('Runs application pods and services')
                : translate('Provides distributed storage for the cluster')
            }
            helpEnd
            space={5}
          >
            <SelectField
              input={{
                value: nodeGroup.type,
                onChange: handleProfileChange,
                onBlur: () => {},
              }}
              options={nodeProfileOptions}
              simpleValue
            />
          </FormGroup>
        </Col>

        {/* OpenStack Flavor Selection */}
        <Col sm={6} md={4}>
          <FormGroup label={translate('OpenStack flavor')} required space={5}>
            <K8sFlavorSelectionTable
              offeringUuid={offeringUuid}
              selectedFlavor={selectedFlavor}
              onFlavorSelect={handleFlavorSelect}
              nodeGroupType={nodeGroup.type}
              datacenterName={datacenterName}
              minimalSettings={defaultConfigs}
            />
          </FormGroup>
        </Col>

        {/* Node Count */}
        <Col sm={6} md={4}>
          <FormGroup
            label={translate('Number of nodes')}
            required
            help={translate('Number of {type} nodes in this group', {
              type: nodeGroup.type,
            })}
            helpEnd
            space={5}
          >
            <NumberField
              input={
                {
                  value: nodeGroup.node_count,
                  onChange: handleNodeCountChange,
                } as any
              }
              min={1}
              max={20}
            />
          </FormGroup>
        </Col>
      </Row>

      {/* Disk Configuration */}
      <Row>
        <Col sm={6} md={4}>
          <FormGroup
            label={translate('System disk')}
            help={translate('Operating system and kubernetes components')}
            helpEnd
            space={5}
          >
            <Form.Control
              type="number"
              value={nodeGroup.disk_config.system_disk_size_gb}
              disabled
              readOnly
            />
          </FormGroup>
        </Col>

        <Col sm={6} md={4}>
          <FormGroup
            label={translate('Data disk')}
            help={
              nodeGroup.type === 'worker'
                ? translate('Application data and container storage')
                : translate('Local storage cache and temporary data')
            }
            helpEnd
            space={5}
          >
            <NumberField
              input={
                {
                  value: nodeGroup.disk_config.data_disk_size_gb,
                  onChange: (value) => {
                    const v =
                      typeof value === 'object' ? value.target.value : value;
                    handleDiskConfigChange(
                      'data_disk_size_gb',
                      parseInt(v) || 10,
                    );
                  },
                } as any
              }
              min={10}
              max={10000}
            />
          </FormGroup>
        </Col>

        {/* Virtual SAN Disk (only for storage groups) */}
        {isStorageGroup && (
          <Col sm={6} md={4}>
            <FormGroup
              label={translate('Virtual SAN Disk')}
              help={translate(
                'Distributed storage pool for cluster persistence',
              )}
              helpEnd
              space={5}
            >
              <NumberField
                input={
                  {
                    value:
                      nodeGroup.disk_config.virtual_san_disk_size_gb || 500,
                    onChange: (value) => {
                      const v =
                        typeof value === 'object' ? value.target.value : value;
                      handleDiskConfigChange(
                        'virtual_san_disk_size_gb',
                        parseInt(v) || 500,
                      );
                    },
                  } as any
                }
                min={100}
                max={50000}
              />
            </FormGroup>
          </Col>
        )}
      </Row>
    </div>
  );
};
