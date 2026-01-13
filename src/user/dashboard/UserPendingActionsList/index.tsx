import { FC } from 'react';
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

export const UserPendingActionsList: FC<OwnProps> = () => {
  const filter = useSelector((state) =>
    mapStateToFilter(state, USER_PENDING_ACTIONS_FILTER_FORM_ID),
  );

  const tableProps = useTable({
    table: 'UserPendingActions',
    fetchData: createFetcher(userActionsList),
    filter,
  });

  const GridItemWithRefetch = (props: { row: UserAction }) => (
    <PendingActionAlertItem row={props.row} refetch={tableProps.fetch} />
  );

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
    />
  );
};
