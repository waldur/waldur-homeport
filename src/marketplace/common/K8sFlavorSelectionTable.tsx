import { CheckIcon, XIcon, MagnifyingGlassIcon } from '@phosphor-icons/react';
import React, { useMemo, useState } from 'react';
import { Form } from 'react-final-form';
import { OpenStackFlavor, openstackFlavorsList } from 'waldur-js-client';

import { HelpIcon, buttonVariants, cn } from 'waldur-ui';

import { UI_STALE_TIME } from '@/core/constants';
import { formatFilesize } from '@/core/utils';
import { required } from '@/core/validators';
import { FilterBox } from '@/form/FilterBox';
import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { createClientPaginatedFetcher, createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import {
  CommonFlavorSource,
  LocalOpenStackFlavor,
  K8sDefaultConfiguration,
  filterCommonFlavors,
} from './k8s-types';

interface K8sFlavorSelectionTableProps {
  offeringUuid: string;
  selectedFlavor?: LocalOpenStackFlavor;
  onFlavorSelect: (flavor: LocalOpenStackFlavor) => void;
  nodeGroupType: 'worker' | 'storage';
  datacenterName: string;
  minimalSettings?: K8sDefaultConfiguration;
  // On sites the provider fixed: the flavors every site has, listed instead
  // of the offering's own. Rows carry the first site's flavor UUID.
  commonFlavors?: CommonFlavorSource;
  // The flavor is used on every site at once.
  allSites?: boolean;
}

interface FlavorSelectionModalProps {
  resolve: {
    offeringUuid: string;
    onFlavorSelect: (flavor: LocalOpenStackFlavor) => void;
    nodeGroupType: 'worker' | 'storage';
    datacenterName: string;
    minimalSettings?: K8sDefaultConfiguration;
    commonFlavors?: CommonFlavorSource;
    allSites?: boolean;
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
    commonFlavors,
    allSites,
  },
  initialValues,
}) => {
  const { closeDialog } = useModal();
  const [query, setQuery] = useState('');

  // Common flavors are already in memory: filtered here by the worker
  // minimums, which the server applies to the offering's own flavors.
  const commonRows = useMemo(
    () =>
      commonFlavors
        ? filterCommonFlavors(
            commonFlavors.flavors,
            nodeGroupType,
            minimalSettings,
          ).map((flavor) => ({
            uuid: flavor.sites[0]?.flavor_uuid,
            name: flavor.name,
            cores: flavor.cores,
            ram: flavor.ram,
            disk: flavor.disk,
          }))
        : undefined,
    [commonFlavors, nodeGroupType, minimalSettings],
  );

  // Build filter with server-side filtering for minimal requirements
  const filter = useMemo(() => {
    if (commonRows) {
      return { name: query || undefined };
    }
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
  }, [commonRows, offeringUuid, query, nodeGroupType, minimalSettings]);

  const tableProps = useTable({
    // The source names the offering, option and topology the sites belong
    // to; worker and storage groups list different common flavors.
    table: commonRows
      ? `k8s-common-flavor-selection-${commonFlavors.key}-${nodeGroupType}`
      : `k8s-flavor-selection-${offeringUuid}`,
    fetchData: commonRows
      ? createClientPaginatedFetcher(commonRows, { queryField: 'name' })
      : createFetcher(openstackFlavorsList),
    filter,
    staleTime: commonRows ? undefined : UI_STALE_TIME,
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
            title={
              allSites
                ? translate(
                    'Select OpenStack flavor for {type} nodes on all sites',
                    { type: nodeGroupType },
                  )
                : translate(
                    'Select OpenStack flavor for {datacenter} {type} nodes',
                    {
                      datacenter: datacenterName,
                      type: nodeGroupType,
                    },
                  )
            }
            subtitle={
              showMinimalSettingsLabels && (
                <span className="text-quaternary">
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
                <CloseDialogButton className="w-[125px]" />
                <SubmitButton
                  submitting={submitting}
                  disabled={invalid}
                  label={translate('Select flavor')}
                  iconNode={<CheckIcon weight="bold" />}
                  iconOnLeft
                />
              </>
            }
            bodyClassName="h-[500px]"
          >
            <div className="mb-2.5">
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
  commonFlavors,
  allSites,
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
        commonFlavors,
        allSites,
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
    <div className="grid">
      <button
        type="button"
        className={cn(
          buttonVariants({ variant: 'text-primary', size: 'lg' }),
          'ellipsis justify-start gap-1.5',
        )}
        onClick={openModal}
        disabled={!offeringUuid}
      >
        <span className="ellipsis">
          {selectedFlavor ? selectedFlavor.name : translate('Select...')}
        </span>
        {selectedFlavor ? (
          <HelpIcon
            label={
              <div className="text-start">
                <span className="block">vCPUs: {selectedFlavor.vcpus}</span>
                <span>RAM: {formatFilesize(selectedFlavor.ram)}</span>
              </div>
            }
          />
        ) : null}
        {selectedFlavor ? (
          <XIcon
            weight="bold"
            size={16}
            className="text-quinary hover:text-quaternary cursor-pointer ms-auto"
            onClick={(e) => {
              e.stopPropagation();
              onFlavorSelect(null);
            }}
          />
        ) : (
          <MagnifyingGlassIcon
            weight="bold"
            size={16}
            className="text-quinary ms-auto"
          />
        )}
      </button>
    </div>
  );
};
