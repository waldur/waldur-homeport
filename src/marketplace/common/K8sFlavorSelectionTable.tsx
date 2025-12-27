import {
  CheckIcon,
  QuestionIcon,
  XIcon,
  MagnifyingGlassIcon,
} from '@phosphor-icons/react';
import React, { useMemo, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';
import { OpenStackFlavor, openstackFlavorsList } from 'waldur-js-client';

import { Tip } from '@waldur/core/Tooltip';
import { formatFilesize } from '@waldur/core/utils';
import { required } from '@waldur/core/validators';
import { FilterBox } from '@waldur/form/FilterBox';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
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
  resolve: {
    offeringUuid: string;
    onFlavorSelect: (flavor: LocalOpenStackFlavor) => void;
    nodeGroupType: 'worker' | 'storage';
    datacenterName: string;
    minimalSettings?: K8sDefaultConfiguration;
  };
  initialValues?: {
    flavor: OpenStackFlavor;
  };
}

const FlavorSelectionModal = reduxForm<{}, FlavorSelectionModalProps>({
  form: 'flavorSelection',
})(({
  handleSubmit,
  invalid,
  resolve: {
    offeringUuid,
    onFlavorSelect,
    nodeGroupType,
    datacenterName,
    minimalSettings,
  },
}) => {
  const { closeDialog } = useModal();
  const [query, setQuery] = useState('');

  // Build filter with server-side filtering for minimal requirements
  const filter = useMemo(() => {
    const baseFilter: Record<string, unknown> = {
      offering_uuid: offeringUuid,
      name: query || undefined,
    };

    // Apply minimal requirements filter for worker nodes
    if (nodeGroupType === 'worker' && minimalSettings) {
      if (minimalSettings.minimal_worker_vcpus) {
        baseFilter.cores__gte = minimalSettings.minimal_worker_vcpus;
      }
      if (minimalSettings.minimal_worker_ram_gb) {
        // Convert GB to MB for the API
        baseFilter.ram__gte = minimalSettings.minimal_worker_ram_gb * 1024;
      }
    }

    return baseFilter;
  }, [offeringUuid, query, nodeGroupType, minimalSettings]);

  const tableProps = useTable({
    table: `k8s-flavor-selection-${offeringUuid}`,
    fetchData: createFetcher(openstackFlavorsList),
    filter,
    staleTime: 3 * 60 * 1000,
  });

  const handleConfirmSelection = (formData) => {
    if (!formData.flavor) return;
    const flavor = formData.flavor as OpenStackFlavor;
    const localFlavor: LocalOpenStackFlavor = {
      uuid: flavor.uuid,
      name: flavor.name,
      vcpus: flavor.cores || 0,
      ram: flavor.ram || 0,
      disk: flavor.disk || 0,
    };
    onFlavorSelect(localFlavor);
    closeDialog();
  };

  const showMinimalSettingsLabels =
    nodeGroupType === 'worker' &&
    minimalSettings &&
    (minimalSettings.minimal_worker_vcpus ||
      minimalSettings.minimal_worker_ram_gb);

  return (
    <form onSubmit={handleSubmit(handleConfirmSelection)}>
      <ModalDialog
        title={translate(
          'Select OpenStack flavor for {datacenter} {type} nodes',
          {
            datacenter: datacenterName,
            type: nodeGroupType,
          },
        )}
        subtitle={
          showMinimalSettingsLabels && (
            <span className="text-muted">
              {translate('Minimal requirements:')}
              {minimalSettings.minimal_worker_vcpus && (
                <> {minimalSettings.minimal_worker_vcpus}+ vCPUs</>
              )}
              {minimalSettings.minimal_worker_ram_gb && (
                <>, {minimalSettings.minimal_worker_ram_gb}+ GB RAM</>
              )}
            </span>
          )
        }
        footer={
          <>
            <CloseDialogButton className="w-125px" />
            <Button variant="primary" type="submit" disabled={invalid}>
              <span className="svg-icon svg-icon-2">
                <CheckIcon weight="bold" />
              </span>
              {translate('Select flavor')}
            </Button>
          </>
        }
        bodyClassName="h-500px"
      >
        <div className="mb-3">
          <FilterBox
            type="search"
            placeholder={translate('Search flavors...')}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <Table
          {...tableProps}
          columns={[
            {
              title: translate('Flavor'),
              render: ({ row }) => <strong>{row.name}</strong>,
            },
            {
              title: translate('vCPUs'),
              render: ({ row }) => row.cores || 0,
              orderField: 'cores',
            },
            {
              title: translate('RAM'),
              render: ({ row }) => formatFilesize(row.ram || 0),
              orderField: 'ram',
            },
          ]}
          verboseName={translate('flavors')}
          hasActionBar={false}
          cardBordered={false}
          fullWidth
          minHeight="auto"
          fieldType="radio"
          fieldName="flavor"
          validate={required}
        />
      </ModalDialog>
    </form>
  );
});

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
  const dispatch = useDispatch();
  const openModal = () =>
    dispatch(
      openModalDialog(FlavorSelectionModal, {
        resolve: {
          offeringUuid: offeringUuid,
          onFlavorSelect: onFlavorSelect,
          nodeGroupType: nodeGroupType,
          datacenterName: datacenterName,
          minimalSettings: minimalSettings,
        },
        initialValues: selectedFlavor
          ? {
              flavor: {
                uuid: selectedFlavor.uuid,
                name: selectedFlavor.name,
                cores: selectedFlavor.vcpus,
                ram: selectedFlavor.ram,
                disk: selectedFlavor.disk,
              } satisfies OpenStackFlavor,
            }
          : undefined,
        size: 'lg',
      }),
    );

  return (
    <div className="d-grid">
      <Button
        variant="text-primary"
        size="lg"
        className="ellipsis justify-content-start gap-2"
        onClick={openModal}
        disabled={!offeringUuid}
      >
        <span className="ellipsis">
          {selectedFlavor ? selectedFlavor.name : translate('Select...')}
        </span>
        {selectedFlavor ? (
          <Tip
            id={'tip-flavor-' + selectedFlavor.uuid}
            label={
              <div className="text-start">
                <span className="d-block">vCPUs: {selectedFlavor.vcpus}</span>
                <span>RAM: {formatFilesize(selectedFlavor.ram)}</span>
              </div>
            }
          >
            <QuestionIcon weight="bold" size={16} className="text-gray-400" />
          </Tip>
        ) : null}
        {selectedFlavor ? (
          <XIcon
            weight="bold"
            size={16}
            className="text-gray-400 text-hover-quaternary ms-auto"
            onClick={(e) => {
              e.stopPropagation();
              onFlavorSelect(null);
            }}
          />
        ) : (
          <MagnifyingGlassIcon
            weight="bold"
            size={16}
            className="text-gray-400 ms-auto"
          />
        )}
      </Button>
    </div>
  );
};
