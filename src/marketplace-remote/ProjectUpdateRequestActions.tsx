import { ReviewActions } from '@waldur/marketplace-remote/ReviewActions';

import { approveProjectUpdateRequest, rejectProjectUpdateRequest } from './api';

export const ProjectUpdateRequestActions = ({ request, refetch }) => (
  <ReviewActions
    request={request}
    refetch={refetch}
    approveMethod={approveProjectUpdateRequest}
    rejectMethod={rejectProjectUpdateRequest}
  />
);
