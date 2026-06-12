import { FunctionComponent, useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';
import { marketplaceSoftwarePackagesList, Offering } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import {
  MarketplaceSoftwarePackagesFilter,
  selectMarketplaceSoftwarePackagesFilter,
  MarketplaceSoftwarePackagesFilterFormId,
} from '@/table/generated/MarketplaceSoftwarePackagesFilter';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { SoftwarePackageExpandableRow } from './SoftwarePackageExpandableRow';

interface PublicOfferingSoftwareCatalogTableProps {
  offering: Offering;
}

const PublicOfferingSoftwareCatalogTableTable: FunctionComponent<
  PublicOfferingSoftwareCatalogTableProps
> = ({ offering }) => {
  const SoftwarePackageExpandableRowWithOffering = ({ row }) => (
    <SoftwarePackageExpandableRow row={row} offering={offering} />
  );

  const getTableSubtitle = () => {
    const enabledCpuFamily =
      offering?.software_catalogs?.flatMap(
        (sc) => sc.enabled_cpu_family || [],
      ) || [];
    const enabledCpuMicroarchitectures =
      offering?.software_catalogs?.flatMap(
        (sc) => sc.enabled_cpu_microarchitectures || [],
      ) || [];

    const uniqueEnabledCpuFamily = [...new Set(enabledCpuFamily)];
    const uniqueCpuMicroarchitectures = [
      ...new Set(enabledCpuMicroarchitectures),
    ];

    const parts = [];
    if (uniqueEnabledCpuFamily.length > 0) {
      parts.push(
        `${translate('CPU Family')}: ${uniqueEnabledCpuFamily.join(', ')}`,
      );
    }
    // Only show platforms if there are multiple platforms or if the single platform is not 'generic'
    if (
      uniqueCpuMicroarchitectures.length > 1 ||
      (uniqueCpuMicroarchitectures.length === 1 &&
        uniqueCpuMicroarchitectures[0] !== 'generic')
    ) {
      parts.push(
        `${translate('CPU Microarchitectures')}: ${uniqueCpuMicroarchitectures.join(', ')}`,
      );
    }

    return parts.length > 0 ? parts.join(' | ') : null;
  };
  const { values } = useFormState();

  const formFilter = useMemo(
    () => selectMarketplaceSoftwarePackagesFilter(values),
    [values],
  );

  const filter = useMemo(
    () => ({
      offering_uuid: offering.uuid,
      ...(offering.software_catalogs?.length > 0 && {
        cpu_family: offering.software_catalogs.flatMap(
          (sc) => sc.enabled_cpu_family || '',
        )[0],
        cpu_microarchitecture: offering.software_catalogs.flatMap(
          (sc) => sc.enabled_cpu_microarchitectures || [],
        ),
      }),
      ...formFilter,
    }),
    [offering.uuid, offering.software_catalogs, formFilter],
  );

  const tableProps = useTable({
    table: 'OfferingSoftwarePackages-' + offering.uuid,
    fetchData: createFetcher(marketplaceSoftwarePackagesList),
    queryField: 'query',
    filter,
  });

  return (
    <Table
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
          orderField: 'name',
          id: 'name',
          keys: ['name'],
          width: '15%',
        },
        {
          title: translate('Extension'),
          render: ({ row }) =>
            row.is_extension ? (
              <Badge variant="primary" pill outline>
                {translate('Extension')}
              </Badge>
            ) : (
              '—'
            ),
          orderField: 'is_extension',
          id: 'is_extension',
          keys: ['is_extension'],
          width: '10%',
        },
        {
          title: translate('Description'),
          render: ({ row }) =>
            row.description ? (
              <Tip id={`desc-${row.uuid}`} label={row.description} autoWidth>
                <span>{row.description}</span>
              </Tip>
            ) : (
              renderFieldOrDash(row.description)
            ),
          orderField: 'description',
          id: 'description',
          keys: ['description', 'uuid'],
          width: '40%',
        },
        {
          title: translate('Catalog'),
          render: ({ row }) => (
            <>
              {row.catalog_name}
              {row.catalog_type_display && (
                <span className="ms-2 badge badge-light-info">
                  {row.catalog_type_display}
                </span>
              )}
            </>
          ),
          orderField: 'catalog_name',
          filter: 'catalog_name',
          id: 'catalog_name',
          optional: true,
          keys: ['catalog_name'],
        },
        {
          title: translate('Version'),
          render: ({ row }) => <>{row.catalog_version}</>,
          orderField: 'catalog_version',
          filter: 'catalog_version',
          id: 'catalog_version',
          keys: ['catalog_version'],
          optional: true,
        },
        {
          title: translate('Type'),
          render: ({ row }) => (
            <>
              {renderFieldOrDash(row.catalog_type_display || row.catalog_type)}
            </>
          ),
          orderField: 'catalog_type',
          filter: 'catalog_type',
          id: 'catalog_type',
          keys: ['catalog_type', 'catalog_type_display'],
          optional: true,
        },
        {
          title: translate('Homepage'),
          width: '20%',
          render: ({ row }) =>
            row.homepage ? (
              <a href={row.homepage} target="_blank" rel="noopener noreferrer">
                {row.homepage}
              </a>
            ) : (
              '—'
            ),
          id: 'homepage',
          keys: ['homepage'],
          orderField: 'homepage',
        },
      ]}
      title={translate('Software packages')}
      verboseName={translate('Software packages')}
      subtitle={getTableSubtitle()}
      hasQuery
      showPageSizeSelector
      enableExport
      hasOptionalColumns
      filters={<MarketplaceSoftwarePackagesFilter />}
      filter={filter}
      expandableRow={SoftwarePackageExpandableRowWithOffering}
      formId={MarketplaceSoftwarePackagesFilterFormId}
    />
  );
};

export const PublicOfferingSoftwareCatalogTable = (props) => (
  <Form
    id={MarketplaceSoftwarePackagesFilterFormId}
    onSubmit={() => {}}
    subscription={{
      values: true,
    }}
  >
    {() => <PublicOfferingSoftwareCatalogTableTable {...props} />}
  </Form>
);
