import { GlobalUserDataAccessLog } from 'waldur-js-client';

import { ActionsDropdown } from '@/table/ActionsDropdown';

import { DataAccessLogDeleteButton } from './DataAccessLogDeleteButton';

interface DataAccessLogsRowActionsProps {
  row: GlobalUserDataAccessLog;
  refetch: () => void;
}

export const DataAccessLogsRowActions = ({
  row,
  refetch,
}: DataAccessLogsRowActionsProps) => (
  <ActionsDropdown
    row={row}
    refetch={refetch}
    actions={[DataAccessLogDeleteButton]}
  />
);
