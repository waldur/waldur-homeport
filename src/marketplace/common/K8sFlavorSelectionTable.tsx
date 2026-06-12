import {
  CheckIcon,
  QuestionIcon,
  XIcon,
  MagnifyingGlassIcon,
} from '@phosphor-icons/react';
import React, { useMemo, useState } from 'react';
// eslint-disable-next-line waldur-custom/no-direct-bootstrap-button -- Complex selector button with custom children, tooltip, and nested click handler
import { Button } from 'react-bootstrap';
import { Form } from 'react-final-form';
import { OpenStackFlavor, openstackFlavorsList } from 'waldur-js-client';

import { UI_STALE_TIME } from '@/core/constants';
import { Tip } from '@/core/Tooltip';
import { formatFilesize } from '@/core/utils';
import { required } from '@/core/validators';
import { FilterBox } from '@/form/FilterBox';
import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

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

const FlavorSelectionModal: React.FC<FlavorSelectionModalProps> = ({
  resolve: {
    offeringUuid,
    onFlavorSelect,
    nodeGroupType,
    datacenterName,
    minimalSettings,
  },
  initialValues,
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
    staleTime: UI_STALE_TIME,
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
    <Form onSubmit={handleConfirmSelection} initialValues={initialValues}>
      {({ handleSubmit, invalid, submitting }) => (
        <form onSubmit={handleSubmit}>
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
                <SubmitButton
                  submitting={submitting}
                  disabled={invalid}
                  label={translate('Select flavor')}
                  iconNode={<CheckIcon weight="bold" />}
                  iconOnLeft
                />
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
      )}
    </Form>
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
  const { openDialog } = useModal();
  const openModal = () =>
    openDialog(FlavorSelectionModal, {
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
            } as OpenStackFlavor,
          }
        : undefined,
      size: 'lg',
    });

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
