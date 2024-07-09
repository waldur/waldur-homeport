import { ReviewApproveAction } from './ReviewApproveAction';
import { ReviewRejectAction } from './ReviewRejectAction';

export const ReviewActions = ({
  request,
  refetch,
  approveMethod,
  rejectMethod,
}) => (
  <>
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
  </>
);
