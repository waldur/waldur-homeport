import { useRouter } from '@uirouter/react';
import { FunctionComponent, useMemo } from 'react';
import { marketplaceResourcesList, Resource } from 'waldur-js-client';

import { HelpIcon } from 'waldur-ui';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { NON_TERMINATED_STATES } from '@/marketplace/resources/list/constants';
import { ResourceStateField } from '@/marketplace/resources/list/ResourceStateField';
import { NoResult } from '@/navigation/header/search/NoResult';
import { ResourceLink } from '@/resource/ResourceLink';
import { createFetcher } from '@/table/api';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import {
  MarketplaceResourcesFilter,
  selectMarketplaceResourcesFilter,
  MarketplaceResourcesFilterFormId,
} from '@/table/generated/MarketplaceResourcesFilter';
import Table from '@/table/Table';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';

import { useActiveVendorOfferingMappings, useArrowSettings } from '../api';

import { getArrowLicense } from './arrowLicense';
import { ArrowResourceImportButton } from './ArrowResourceImportButton';
import { ArrowResourcesActions } from './ArrowResourcesActions';

interface ArrowResourcesListProps {
  settings?: { uuid: string } | null;
}

export const ArrowResourcesList: FunctionComponent<
  ArrowResourcesListProps
> = () => {
  const router = useRouter();
  const settingsQuery = useArrowSettings();
  const settings = settingsQuery.data;
  const mappingsQuery = useActiveVendorOfferingMappings(settings?.uuid);
  const vendorMappings = mappingsQuery.data;
  // Only resources of offerings an Arrow vendor is mapped to are Arrow's.
  const mappedOfferingUuids = useMemo(
    () =>
      Array.from(new Set((vendorMappings ?? []).map((m) => m.offering_uuid))),
    [vendorMappings],
  );

  if (settingsQuery.isLoading || (settings && mappingsQuery.isLoading)) {
    return <LoadingSpinner />;
  }
  if (settingsQuery.isError || mappingsQuery.isError) {
    // Without the mappings the list cannot tell which offerings are Arrow's.
    return (
      <LoadingErred
        message={translate('Unable to load the Arrow vendor mappings.')}
        loadData={() => {
          settingsQuery.refetch();
          mappingsQuery.refetch();
        }}
      />
    );
  }
  if (!mappedOfferingUuids.length) {
    return (
      <NoResult
        title={translate('No Arrow offerings yet')}
        message={translate(
          'Arrow resources are those of offerings mapped to an Arrow vendor. Map a vendor to an offering first.',
        )}
        buttonTitle={translate('Go to Vendor Offerings')}
        callback={() =>
          router.stateService.go('admin-arrow', { tab: 'vendor-offerings' })
        }
      />
    );
  }
  return <MappedResourcesList offeringUuids={mappedOfferingUuids} />;
};

const MappedResourcesList = ({
  offeringUuids,
}: {
  offeringUuids: string[];
}) => {
  const values = useFilterValues('ArrowResources');

  const filterValues = useMemo(
    () => selectMarketplaceResourcesFilter(values),
    [values],
  );

  const formValues = values;

  const filter = useMemo(
    () => ({
      state: NON_TERMINATED_STATES,
      ...filterValues,
      // One comma-separated value: the backend keeps only the last of
      // repeated params.
      offering_uuid: [offeringUuids.join(',')],
    }),
    [filterValues, offeringUuids],
  );

  const tableProps = useTable({
    table: 'ArrowResources',
    syncFiltersToURL: true,
    fetchData: createFetcher(marketplaceResourcesList),
    filter,
    queryField: 'query',
    mandatoryFields: [
      'uuid',
      'name',
      'state',
      'backend_id',
      'attributes',
      'customer_name',
      'customer_uuid',
      'project_name',
      'project_uuid',
      'backend_metadata',
      'provider_uuid',
    ],
  });

  return (
    <Table<Resource>
      {...tableProps}
      columns={[
        {
          title: translate('Resource'),
          render: ({ row }) => (
            <ResourceLink
              uuid={row.uuid}
              label={
                <span className="font-medium">
                  {row.name || DASH_ESCAPE_CODE}
                </span>
              }
            />
          ),
        },
        {
          title: translate('Organization'),
          render: ({ row }) => (
            <span>{row.customer_name || DASH_ESCAPE_CODE}</span>
          ),
          filter: 'customer_uuid',
        },
        {
          title: translate('Project'),
          render: ({ row }) => (
            <span>{row.project_name || DASH_ESCAPE_CODE}</span>
          ),
          filter: 'project_uuid',
        },
        {
          title: (
            <>
              {translate('Arrow license')}{' '}
              <HelpIcon
                label={translate(
                  'The ArrowSphere license reference (XSP…) this resource is billed through. Consumption and billing lines are matched to the resource by it. Empty means the resource is not linked to a license yet: use Link to Arrow license in the row menu.',
                )}
                size={18}
              />
            </>
          ),
          render: ({ row }) => {
            const license = getArrowLicense(row);
            return license ? (
              <span>{license}</span>
            ) : (
              <span className="text-quaternary">{DASH_ESCAPE_CODE}</span>
            );
          },
        },
        {
          title: (
            <>
              {translate('Vendor subscription')}{' '}
              <HelpIcon
                label={translate(
                  "The vendor's own subscription ID (for example the Azure subscription), as found by the resource sync. Shown only when it differs from the Arrow license.",
                )}
                size={18}
              />
            </>
          ),
          render: ({ row }) =>
            row.backend_id && row.backend_id !== getArrowLicense(row) ? (
              <span>{row.backend_id}</span>
            ) : (
              <span className="text-quaternary">{DASH_ESCAPE_CODE}</span>
            ),
        },
        {
          title: translate('State'),
          render: ({ row }) => (
            <ResourceStateField resource={row} shape="pill" tone="outline" />
          ),
        },
      ]}
      title={translate('Resources')}
      subtitle={translate(
        'Resources of offerings mapped to an Arrow vendor on the Vendor Offerings tab. A resource linked to a license in another offering is billed through Arrow but is not listed here.',
      )}
      verboseName={translate('resources')}
      initialSorting={{ field: 'name', mode: 'asc' }}
      hasQuery
      filters={
        <MarketplaceResourcesFilter
          organizationUuid={formValues?.customer_uuid?.uuid}
        />
      }
      tableActions={<ArrowResourceImportButton refetch={tableProps.fetch} />}
      rowActions={({ row }) => (
        <ArrowResourcesActions row={row} refetch={tableProps.fetch} />
      )}
      formId={MarketplaceResourcesFilterFormId}
    />
  );
};
