import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { userActionsList, UserAction } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { PendingActionAlertItem } from './PendingActionAlertItem';
import {
  PendingActionsFilterForm,
  mapStateToFilter,
  USER_PENDING_ACTIONS_FILTER_FORM_ID,
} from './PendingActionsFilter';
import { RecalculateUserActionsButton } from './RecalculateUserActionsButton';
import { OwnProps } from './types';

// Map urgency to numeric priority for sorting (higher = more urgent)
const urgencyPriority: Record<string, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

// Sort actions: high urgency first, then by due date (earliest first)
const sortActions = (actions: UserAction[]): UserAction[] => {
  return [...actions].sort((a, b) => {
    const urgencyA = urgencyPriority[a.urgency] || 0;
    const urgencyB = urgencyPriority[b.urgency] || 0;

    // Sort by urgency first (descending - high first)
    if (urgencyA !== urgencyB) {
      return urgencyB - urgencyA;
    }

    // Then sort by due date (ascending - earliest first)
    const dateA = new Date(a.due_date).getTime();
    const dateB = new Date(b.due_date).getTime();
    return dateA - dateB;
  });
};

// Custom fetcher that sorts results client-side
const createSortedFetcher = (baseFetcher: ReturnType<typeof createFetcher>) => {
  return async (request: any) => {
    const result = await baseFetcher(request);
    return {
      ...result,
      rows: sortActions(result.rows),
    };
  };
};

export const UserPendingActionsList: FC<OwnProps> = () => {
  const filter = useSelector((state) =>
    mapStateToFilter(state, USER_PENDING_ACTIONS_FILTER_FORM_ID),
  );

  const fetchData = useMemo(
    () => createSortedFetcher(createFetcher(userActionsList)),
    [],
  );

  const tableProps = useTable({
    table: 'UserPendingActions',
    fetchData,
    filter,
  });

  const GridItemWithRefetch = (props: { row: UserAction }) => (
    <PendingActionAlertItem row={props.row} refetch={tableProps.fetch} />
  );

  // Hide table when empty (after initial load)
  if (!tableProps.loading && tableProps.rows.length === 0) {
    return null;
  }

  return (
    <Table
      {...tableProps}
      showPageSizeSelector
      title={translate('Pending actions')}
      verboseName={translate('Pending actions')}
      fullWidth
      gridItem={GridItemWithRefetch}
      gridSize={{ xs: 12 }}
      gridSpace={0}
      initialMode="grid"
      bodyClassName="pt-0"
      minHeight="auto"
      tableActions={<RecalculateUserActionsButton refetch={tableProps.fetch} />}
      filters={<PendingActionsFilterForm />}
      hasQuery={true}
    />
  );
};
