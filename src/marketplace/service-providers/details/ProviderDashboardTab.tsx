import { useMemo } from 'react';
import {
  marketplacePublicOfferingsList,
  ProviderOfferingDetails as Offering,
} from 'waldur-js-client';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { OfferingCard } from '@/marketplace/common/OfferingCard';
import { getLabel } from '@/marketplace/common/registry';
import { OfferingDetailsLink } from '@/marketplace/links/OfferingDetailsLink';
import { OfferingStateField } from '@/marketplace/offerings/OfferingStateField';
import { PublicCallsList } from '@/proposals/PublicCallsList';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

export const ProviderOfferingsList = (props) => {
  const columns = [
    {
      title: translate('Name'),
      render: ({ row }: { row: Offering }) => (
        <OfferingDetailsLink offering_uuid={row.uuid}>
          {row.name}
        </OfferingDetailsLink>
      ),

      copyField: (row) => row.name,
      orderField: 'name',
    },
    {
      title: translate('Organization'),
      render: ({ row }) => renderFieldOrDash(row.customer_name),
    },
    {
      title: translate('Type'),
      render: ({ row }) => <>{getLabel(row.type)}</>,
    },
    {
      title: translate('State'),
      render: ({ row }) => <OfferingStateField offering={row} />,
    },
  ];

  const filter = useMemo(
    () => ({ customer_uuid: props.provider_uuid }),
    [props.provider_uuid],
  );

  const tableProps = useTable({
    table: 'ProviderOfferingsList',
    filter,
    fetchData: createFetcher(marketplacePublicOfferingsList),
    queryField: 'keyword',
  });

  return (
    <Table
      {...tableProps}
      initialMode={props.initialMode}
      columns={columns}
      title={translate('Offerings')}
      gridClassName="lg:grid-cols-2 xl:grid-cols-3"
      gridItem={({ row }) => <OfferingCard offering={row} />}
      hoverShadow={{ grid: false }}
    />
  );
};

export const ProviderDashboardTab = (props) => {
  return (
    <>
      <ProviderOfferingsList
        provider_uuid={props.data.provider.customer_uuid}
        initialMode="grid"
      />

      {isFeatureVisible(
        MarketplaceFeatures.show_call_management_functionality,
      ) && (
        <div className="mt-4">
          <PublicCallsList
            provider_uuid={props.data.provider.customer_uuid}
            offering_uuid={null}
            initialMode="grid"
          />
        </div>
      )}
    </>
  );
};
