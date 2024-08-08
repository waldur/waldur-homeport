import { FC, useMemo } from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { AvailableOfferingCard } from '@waldur/proposals/AvailableOfferingCard';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

export const CallsAvailableOfferingsList: FC = () => {
  const filter = useMemo(
    () => ({ page_size: 6, accessible_via_calls: true }),
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
      mode="grid"
      title={translate('Available offerings')}
      verboseName={translate('Available offerings')}
      tableActions={
        <Link
          state="calls-for-proposals-all-available-offerings"
          label={translate('View all')}
          className="btn btn-light"
        />
      }
      hasQuery={false}
      hasPagination={false}
    />
  );
};
