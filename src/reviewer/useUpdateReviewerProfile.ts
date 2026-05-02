import {
  ReviewerProfile,
  reviewerProfilesMePartialUpdate,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';

export const useUpdateReviewerProfile = () => {
  return useManagedMutation<any, any, Partial<ReviewerProfile>>({
    mutationFn: (data) => reviewerProfilesMePartialUpdate({ body: data }),
    invalidateQueries: [{ queryKey: ['reviewer-profile-me'] }],
    successMessage: translate('Reviewer profile updated.'),
    errorMessage: translate('Unable to update reviewer profile.'),
  });
};
