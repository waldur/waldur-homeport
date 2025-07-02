import { Link } from '@waldur/core/Link';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { OfferingCard } from '@waldur/marketplace/common/OfferingCard';
import { getLabel } from '@waldur/marketplace/common/registry';
import { OfferingStateField } from '@waldur/marketplace/offerings/OfferingStateField';
import { Offering } from '@waldur/marketplace/types';
import { PublicCallsList } from '@waldur/proposals/PublicCallsList';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

export const ProviderOfferingsList = (props) => {
  const columns = [
    {
      title: translate('Name'),
      render: ({ row }: { row: Offering }) => (
        <Link
          state="public-offering.marketplace-public-offering"
          params={{ uuid: row.uuid }}
        >
          {row.name}
        </Link>
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

  const tableProps = useTable({
    table: 'ProviderOfferingsList',
    fetchData: createFetcher('marketplace-public-offerings', {
      params: { customer_uuid: props.provider_uuid },
    }),
    queryField: 'keyword',
  });

  return (
    <Table
      {...tableProps}
      initialMode={props.initialMode}
      columns={columns}
      title={translate('Offerings')}
      gridSize={{ lg: 6, xl: 4 }}
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
        <div className="mt-5">
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
