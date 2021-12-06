import { ReviewActions } from '@waldur/marketplace-flows/ReviewActions';

import { approveProjectUpdateRequest, rejectProjectUpdateRequest } from './api';

export const ProjectUpdateRequestActions = ({ request, refreshList }) => (
  <ReviewActions
    request={request}
    refreshList={refreshList}
    approveMethod={approveProjectUpdateRequest}
    rejectMethod={rejectProjectUpdateRequest}
  />
);
