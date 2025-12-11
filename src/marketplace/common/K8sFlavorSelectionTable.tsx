import { EyeIcon, CheckIcon } from '@phosphor-icons/react';
import React, { useMemo, useState, useCallback } from 'react';
import { Modal, Button, Card, Row, Col, Form } from 'react-bootstrap';
import { OpenStackFlavor, openstackFlavorsList } from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { formatFilesize } from '@waldur/core/utils';
import { FilterBox } from '@waldur/form/FilterBox';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import {
  LocalOpenStackFlavor,
  K8sDefaultConfiguration,
} from './multi-datacenter-k8s-types';

interface K8sFlavorSelectionTableProps {
  offeringUuid: string;
  selectedFlavor?: LocalOpenStackFlavor;
  onFlavorSelect: (flavor: LocalOpenStackFlavor) => void;
  nodeGroupType: 'worker' | 'storage';
  datacenterName: string;
  minimalSettings?: K8sDefaultConfiguration;
}

interface FlavorSelectionModalProps {
  show: boolean;
  onClose: () => void;
  offeringUuid: string;
  selectedFlavor?: LocalOpenStackFlavor;
  onFlavorSelect: (flavor: LocalOpenStackFlavor) => void;
  nodeGroupType: 'worker' | 'storage';
  datacenterName: string;
  minimalSettings?: K8sDefaultConfiguration;
}

const FlavorSelectionModal: React.FC<FlavorSelectionModalProps> = ({
  show,
  onClose,
  offeringUuid,
  selectedFlavor,
  onFlavorSelect,
  nodeGroupType,
  datacenterName,
  minimalSettings,
}) => {
  const [query, setQuery] = useState('');
  const [tempSelectedFlavor, setTempSelectedFlavor] =
    useState<LocalOpenStackFlavor | null>(selectedFlavor || null);

  const filter = useMemo(
    () => ({
      offering_uuid: offeringUuid,
      name: query || undefined,
    }),
    [offeringUuid, query],
  );

  // Filter flavors based on minimal requirements for worker nodes
  const filterFlavor = useCallback(
    (flavor: OpenStackFlavor) => {
      if (nodeGroupType === 'worker' && minimalSettings) {
        const minVcpus = minimalSettings.minimal_worker_vcpus;
        const minRamGB = minimalSettings.minimal_worker_ram_gb;

        if (minVcpus && (flavor.cores || 0) < minVcpus) {
          return false;
        }

        if (minRamGB && (flavor.ram || 0) < minRamGB * 1024) {
          // Convert GB to MB
          return false;
        }
      }
      return true;
    },
    [nodeGroupType, minimalSettings],
  );

  const tableProps = useTable({
    table: `k8s-flavor-selection-${offeringUuid}`,
    fetchData: createFetcher(openstackFlavorsList),
    filter,
    staleTime: 3 * 60 * 1000,
  });

  // Filter rows based on minimal requirements for worker nodes
  const filteredRows = useMemo(() => {
    if (!tableProps.rows) return [];
    return tableProps.rows.filter(filterFlavor);
  }, [tableProps.rows, filterFlavor]);

  const handleFlavorSelect = (flavor: OpenStackFlavor) => {
    const localFlavor: LocalOpenStackFlavor = {
      uuid: flavor.uuid,
      name: flavor.name,
      vcpus: flavor.cores || 0,
      ram: flavor.ram || 0,
      disk: flavor.disk || 0,
    };
    setTempSelectedFlavor(localFlavor);
  };

  const handleConfirmSelection = () => {
    if (tempSelectedFlavor) {
      onFlavorSelect(tempSelectedFlavor);
      onClose();
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>
          <CheckIcon className="me-2" size={20} weight="bold" />
          {translate('Select OpenStack Flavor for {datacenter} {type} Nodes', {
            datacenter: datacenterName,
            type: nodeGroupType,
          })}
          {nodeGroupType === 'worker' && minimalSettings && (
            <div className="mt-2">
              <small className="text-muted">
                {translate('Minimal requirements:')}
                {minimalSettings.minimal_worker_vcpus && (
                  <> {minimalSettings.minimal_worker_vcpus}+ vCPUs</>
                )}
                {minimalSettings.minimal_worker_ram_gb && (
                  <>, {minimalSettings.minimal_worker_ram_gb}+ GB RAM</>
                )}
              </small>
            </div>
          )}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Row className="mb-3">
          <Col md={12}>
            <FilterBox
              type="search"
              placeholder={translate('Search flavors...')}
              onChange={(e) => setQuery(e.target.value)}
            />
            {nodeGroupType === 'worker' &&
              minimalSettings &&
              (minimalSettings.minimal_worker_vcpus ||
                minimalSettings.minimal_worker_ram_gb) &&
              tableProps.rows &&
              filteredRows.length < tableProps.rows.length && (
                <div className="mt-2">
                  <small className="text-muted">
                    {translate(
                      'Showing {filtered} of {total} flavors that meet minimal requirements',
                      {
                        filtered: filteredRows.length,
                        total: tableProps.rows.length,
                      },
                    )}
                  </small>
                </div>
              )}
          </Col>
        </Row>

        <Table
          {...tableProps}
          rows={filteredRows}
          columns={[
            {
              title: '',
              render: ({ row }) => (
                <Form.Check
                  type="radio"
                  name="flavor-selection"
                  checked={tempSelectedFlavor?.uuid === row.uuid}
                  onChange={() => handleFlavorSelect(row)}
                />
              ),
              className: 'text-center',
            },
            {
              title: translate('Flavor'),
              render: ({ row }) => <strong>{row.name}</strong>,
            },
            {
              title: translate('vCPUs'),
              render: ({ row }) => {
                const meetsCpuRequirement =
                  !minimalSettings?.minimal_worker_vcpus ||
                  (row.cores || 0) >= minimalSettings.minimal_worker_vcpus ||
                  nodeGroupType !== 'worker';
                return (
                  <Badge
                    variant={meetsCpuRequirement ? 'default' : 'danger'}
                    pill
                    outline
                  >
                    {row.cores || 0}
                  </Badge>
                );
              },
              orderField: 'cores',
              className: 'text-center',
            },
            {
              title: translate('RAM'),
              render: ({ row }) => {
                const meetsRamRequirement =
                  !minimalSettings?.minimal_worker_ram_gb ||
                  (row.ram || 0) >=
                    minimalSettings.minimal_worker_ram_gb * 1024 ||
                  nodeGroupType !== 'worker';
                return (
                  <Badge
                    variant={meetsRamRequirement ? 'purple' : 'danger'}
                    pill
                    outline
                  >
                    {formatFilesize(row.ram || 0)}
                  </Badge>
                );
              },
              orderField: 'ram',
              className: 'text-center',
            },
          ]}
          verboseName={translate('flavors')}
          hasActionBar={false}
          cardBordered={false}
          fullWidth
          minHeight="auto"
          hoverable
        />
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          {translate('Cancel')}
        </Button>
        <Button
          variant="primary"
          onClick={handleConfirmSelection}
          disabled={!tempSelectedFlavor}
        >
          <CheckIcon className="me-2" size={16} weight="bold" />
          {translate('Select Flavor')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export const K8sFlavorSelectionTable: React.FC<
  K8sFlavorSelectionTableProps
> = ({
  offeringUuid,
  selectedFlavor,
  onFlavorSelect,
  nodeGroupType,
  datacenterName,
  minimalSettings,
}) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="d-grid">
        <Button
          variant={selectedFlavor ? 'outline-primary' : 'primary'}
          onClick={() => setShowModal(true)}
          disabled={!offeringUuid}
        >
          <EyeIcon className="me-2" size={16} weight="bold" />
          {selectedFlavor
            ? translate('Change Flavor: {name}', { name: selectedFlavor.name })
            : translate('Select OpenStack Flavor')}
        </Button>
      </div>

      {selectedFlavor && (
        <Card className="mt-2 border-light">
          <Card.Body className="py-2">
            <Row className="align-items-center">
              <Col>
                <small className="text-muted d-block">Selected Flavor</small>
                <strong>{selectedFlavor.name}</strong>
              </Col>
              <Col xs="auto">
                <div className="d-flex gap-2">
                  <Badge variant="default" pill outline>
                    {selectedFlavor.vcpus} vCPU
                  </Badge>
                  <Badge variant="purple" pill outline>
                    {Math.round(selectedFlavor.ram / 1024)}GB RAM
                  </Badge>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      <FlavorSelectionModal
        show={showModal}
        onClose={() => setShowModal(false)}
        offeringUuid={offeringUuid}
        selectedFlavor={selectedFlavor}
        onFlavorSelect={onFlavorSelect}
        nodeGroupType={nodeGroupType}
        datacenterName={datacenterName}
        minimalSettings={minimalSettings}
      />
    </>
  );
};
