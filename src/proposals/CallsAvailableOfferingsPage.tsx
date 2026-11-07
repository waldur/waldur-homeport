import { FunctionComponent, useMemo } from 'react';
import { marketplacePublicOfferingsList } from 'waldur-js-client';

import { translate } from '@/i18n';
import { OfferingDetailsLink } from '@/marketplace/links/OfferingDetailsLink';
import { AvailableOfferingCard } from '@/proposals/AvailableOfferingCard';
import { AvailableOfferingExpandableRow } from '@/proposals/AvailableOfferingExpandableRow';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

/**
 * The offerings an applicant can request through a call right now. Only
 * those taking orders: one in draft or archived cannot be requested, so it is
 * left out rather than listed with its state.
 */
export const CallsAvailableOfferingsPage: FunctionComponent = () => {
  const filter = useMemo(
    () => ({ open_for_proposals: true, state: ['Active'] }),
    [],
  );

  const tableProps = useTable({
    table: 'PublicAvailableOfferingsList',
    fetchData: createFetcher(marketplacePublicOfferingsList),
    queryField: 'name',
    filter,
  });

  return (
    <Table
      title={translate('Available offerings')}
      // The tab above names the list.
      hideTitle
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          orderField: 'name',
          render: ({ row }) => (
            <OfferingDetailsLink offering_uuid={row.uuid}>
              {row.name}
            </OfferingDetailsLink>
          ),
          copyField: (row) => row.name,
        },
        {
          title: translate('Provider'),
          render: ({ row }) => <>{renderFieldOrDash(row.customer_name)}</>,
        },
        {
          title: translate('Category'),
          render: ({ row }) => <>{renderFieldOrDash(row.category_title)}</>,
        },
      ]}
      expandableRow={AvailableOfferingExpandableRow}
      gridItem={({ row }) => <AvailableOfferingCard availableOffering={row} />}
      gridClassName="lg:grid-cols-2 xl:grid-cols-3"
      hoverShadow={{ grid: false }}
      verboseName={translate('Available offerings')}
      initialSorting={{ field: 'name', mode: 'desc' }}
      hasQuery={true}
    />
  );
};
