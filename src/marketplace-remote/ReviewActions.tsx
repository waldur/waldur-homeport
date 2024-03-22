import { ButtonGroup } from 'react-bootstrap';

import { ReviewApproveAction } from './ReviewApproveAction';
import { ReviewRejectAction } from './ReviewRejectAction';

export const ReviewActions = ({
  request,
  refetch,
  approveMethod,
  rejectMethod,
}) => (
  <ButtonGroup>
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
  </ButtonGroup>
);
