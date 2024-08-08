import { FC, useMemo } from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { CallCard } from './CallCard';

export const CallsForProposalsList: FC = () => {
  const filter = useMemo(() => ({ page_size: 6, has_active_round: true }), []);
  const tableProps = useTable({
    table: 'CallsForProposals',
    filter,
    fetchData: createFetcher('proposal-public-calls'),
    staleTime: 3 * 60 * 1000,
  });

  return (
    <Table
      {...tableProps}
      gridItem={({ row }) => <CallCard call={row} />}
      gridSize={{ lg: 6, xl: 4 }}
      mode="grid"
      title={translate('Open calls')}
      verboseName={translate('Open calls')}
      tableActions={
        <Link
          state="calls-for-proposals-all-calls"
          label={translate('View all')}
          className="btn btn-light"
        />
      }
      hasQuery={false}
      hasPagination={false}
    />
  );
};
