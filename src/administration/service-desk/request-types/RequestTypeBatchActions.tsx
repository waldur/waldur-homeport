import { FC } from 'react';
import { RequestTypeAdmin } from 'waldur-js-client';

import { BatchActivateAction } from './BatchActivateAction';
import { BatchDeactivateAction } from './BatchDeactivateAction';
import { BatchDeleteAction } from './BatchDeleteAction';

interface RequestTypeBatchActionsProps {
  rows: RequestTypeAdmin[];
  refetch: () => void;
}

export const RequestTypeBatchActions: FC<RequestTypeBatchActionsProps> = ({
  rows,
  refetch,
}) => (
  <>
    <BatchActivateAction rows={rows} refetch={refetch} />
    <BatchDeactivateAction rows={rows} refetch={refetch} />
    <BatchDeleteAction rows={rows} refetch={refetch} />
  </>
);
