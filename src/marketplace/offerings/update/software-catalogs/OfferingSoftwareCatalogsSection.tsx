import { FC, useState, useMemo } from 'react';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { OfferingSectionProps } from '../types';

import { AddSoftwareCatalogButton } from './AddSoftwareCatalogButton';
import { RowActions } from './RowActions';

export const OfferingSoftwareCatalogsSection: FC<OfferingSectionProps> = (
  props,
) => {
  const [firstFetch, setFirstFetch] = useState(true);

  const tableProps = useTable({
    table: 'OfferingSoftwareCatalogs',
    fetchData: async () => {
      let freshSoftwareCatalogs;
      if (!firstFetch) {
        const res = await props.refetch();
        freshSoftwareCatalogs = res.data?.offering?.software_catalogs;
      } else {
        setFirstFetch(false);
      }

      return Promise.resolve({
        rows: freshSoftwareCatalogs || props.offering.software_catalogs || [],
      });
    },
  });

  const columns = useMemo(() => {
    const baseColumns = [
      {
        title: translate('Catalog'),
        render: ({ row }) => renderFieldOrDash(row.catalog?.name),
      },
      {
        title: translate('Package count'),
        render: ({ row }) => renderFieldOrDash(row.package_count),
      },
      {
        title: translate('Version'),
        render: ({ row }) => renderFieldOrDash(row.catalog?.version),
      },
      {
        title: translate('CPU family'),
        render: ({ row }) => {
          if (!row.enabled_cpu_family || row.enabled_cpu_family.length === 0) {
            return '—';
          }
          // Handle both string arrays and object arrays
          const values = row.enabled_cpu_family.map((item) =>
            typeof item === 'string' ? item : item.value || item,
          );
          return values.join(', ');
        },
      },
      {
        title: translate('CPU microarchitecture'),
        render: ({ row }) => {
          if (
            !row.enabled_cpu_microarchitectures ||
            row.enabled_cpu_microarchitectures.length === 0
          ) {
            return '—';
          }
          // Handle both string arrays and object arrays
          const values = row.enabled_cpu_microarchitectures.map((item) =>
            typeof item === 'string' ? item : item.value || item,
          );
          return values.join(', ');
        },
      },
    ];

    // Add partition column if feature is enabled
    if (isFeatureVisible(MarketplaceFeatures.display_offering_partitions)) {
      baseColumns.push({
        title: translate('Partition'),
        render: ({ row }) => renderFieldOrDash(row.partition?.partition_name),
      });
    }

    return baseColumns;
  }, []);

  return (
    <Table
      {...tableProps}
      columns={columns}
      verboseName={translate('software catalogs')}
      title={translate('Software catalogs')}
      tableActions={
        <AddSoftwareCatalogButton {...props} refetch={tableProps.fetch} />
      }
      rowActions={({ row, fetch }) => (
        <RowActions
          row={row}
          refetch={fetch || props.refetch}
          offering={props.offering}
        />
      )}
    />
  );
};
