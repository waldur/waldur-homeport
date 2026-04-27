import { FC, useMemo } from 'react';
import { proposalPublicCallsList } from 'waldur-js-client';

import { UI_STALE_TIME } from '@/core/constants';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { CallCard } from './CallCard';

export const CallsForProposalsList: FC = () => {
  const filter = useMemo(() => ({ page_size: 6, has_active_round: true }), []);
  const tableProps = useTable({
    table: 'CallsForProposals',
    filter,
    fetchData: createFetcher(proposalPublicCallsList),
    staleTime: UI_STALE_TIME,
  });

  return (
    <Table
      {...tableProps}
      gridItem={({ row }) => <CallCard call={row} />}
      gridSize={{ lg: 6, xxl: 4 }}
      hoverShadow={{ grid: false }}
      mode="grid"
      title={translate('Open calls')}
      verboseName={translate('Open calls')}
      tableActions={
        <Link
          state="calls-for-proposals-all-calls"
          label={translate('View all')}
          className="btn btn-tertiary"
        />
      }
      hasQuery={false}
      hasPagination={false}
    />
  );
};
