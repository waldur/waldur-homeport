import { useQuery } from '@tanstack/react-query';
import { marketplaceOfferingUsersProfileFieldWarningsRetrieve } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';

interface OfferingWarning {
  offering_uuid: string;
  offering_name: string;
}

type ProfileFieldWarnings = Record<string, OfferingWarning[]>;

export const useProfileFieldWarnings = () => {
  return useQuery({
    queryKey: ['profile-field-warnings'],
    queryFn: () =>
      marketplaceOfferingUsersProfileFieldWarningsRetrieve().then(
        (response) => response.data as ProfileFieldWarnings,
      ),
    enabled:
      !!ENV.plugins.WALDUR_CORE.ENFORCE_OFFERING_USER_PROFILE_COMPLETENESS,
    staleTime: 5 * 60 * 1000,
  });
};
