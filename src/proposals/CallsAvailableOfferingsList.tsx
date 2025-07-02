import { FC, useMemo } from 'react';
import { MarketplacePublicOfferingsListData } from 'waldur-js-client';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { AvailableOfferingCard } from '@waldur/proposals/AvailableOfferingCard';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

export const CallsAvailableOfferingsList: FC = () => {
  const filter = useMemo(
    (): MarketplacePublicOfferingsListData['query'] => ({
      page_size: 6,
      accessible_via_calls: true,
    }),
    [],
  );
  const tableProps = useTable({
    table: 'CallsAvailableOfferingsList',
    filter,
    fetchData: createFetcher('marketplace-public-offerings'),
    staleTime: 3 * 60 * 1000,
  });

  return (
    <Table
      {...tableProps}
      gridItem={({ row }) => <AvailableOfferingCard availableOffering={row} />}
      gridSize={{ lg: 6, xl: 4 }}
      hoverShadow={{ grid: false }}
      mode="grid"
      title={translate('Available offerings')}
      verboseName={translate('Available offerings')}
      tableActions={
        <Link
          state="calls-for-proposals-all-available-offerings"
          label={translate('View all')}
          className="btn btn-outline btn-outline-default"
        />
      }
      hasQuery={false}
      hasPagination={false}
    />
  );
};
