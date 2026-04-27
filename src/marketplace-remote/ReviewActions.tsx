import { ActionsDropdown } from '@/table/ActionsDropdown';

import { ReviewApproveAction } from './ReviewApproveAction';
import { ReviewRejectAction } from './ReviewRejectAction';

export const ReviewActions = ({
  request,
  refetch,
  approveMethod,
  rejectMethod,
}) =>
  request.state === 'pending' ? (
    <ActionsDropdown row={request} refetch={refetch}>
      <ReviewApproveAction
        request={request}
        refetch={refetch}
        apiMethod={approveMethod}
      />
      <ReviewRejectAction
        request={request}
        refetch={refetch}
        apiMethod={rejectMethod}
      />
    </ActionsDropdown>
  ) : null;
