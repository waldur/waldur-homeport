import { FC, useMemo } from 'react';
import {
  marketplacePublicOfferingsList,
  MarketplacePublicOfferingsListData,
} from 'waldur-js-client';

import { UI_STALE_TIME } from '@/core/constants';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { AvailableOfferingCard } from '@/proposals/AvailableOfferingCard';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

export const CallsAvailableOfferingsList: FC = () => {
  const filter = useMemo(
    (): MarketplacePublicOfferingsListData['query'] => ({
      page_size: 6,
      open_for_proposals: true,
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
