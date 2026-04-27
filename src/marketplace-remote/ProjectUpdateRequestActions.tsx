import {
  marketplaceProjectUpdateRequestsApprove,
  marketplaceProjectUpdateRequestsReject,
} from 'waldur-js-client';

import { ReviewActions } from '@/marketplace-remote/ReviewActions';

export const ProjectUpdateRequestActions = ({ request, refetch }) => (
  <ReviewActions
    request={request}
    refetch={refetch}
    approveMethod={(uuid) =>
      marketplaceProjectUpdateRequestsApprove({ path: { uuid } })
    }
    rejectMethod={(uuid) =>
      marketplaceProjectUpdateRequestsReject({ path: { uuid } })
    }
  />
);
