import { FC, useMemo } from 'react';
import {
  marketplacePublicOfferingsList,
  MarketplacePublicOfferingsListData,
} from 'waldur-js-client';

import { UI_STALE_TIME } from '@waldur/core/constants';
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
    fetchData: createFetcher(marketplacePublicOfferingsList),
    staleTime: UI_STALE_TIME,
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
          className="btn btn-tertiary"
        />
      }
      hasQuery={false}
      hasPagination={false}
    />
  );
};
