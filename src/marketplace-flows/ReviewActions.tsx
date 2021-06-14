import { ButtonGroup } from 'react-bootstrap';

import { ReviewApproveAction } from './ReviewApproveAction';
import { ReviewRejectAction } from './ReviewRejectAction';

export const ReviewActions = ({
  request,
  refreshList,
  approveMethod,
  rejectMethod,
}) => (
  <ButtonGroup>
    <ReviewApproveAction
      request={request}
      refreshList={refreshList}
      apiMethod={approveMethod}
    />
    <ReviewRejectAction
      request={request}
      refreshList={refreshList}
      apiMethod={rejectMethod}
    />
  </ButtonGroup>
);
