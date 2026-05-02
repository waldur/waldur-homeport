import { useCurrentStateAndParams } from '@uirouter/react';
import { useCallback, useEffect, useState } from 'react';
import {
  OnboardingJustification,
  OnboardingVerification,
  onboardingVerificationsRetrieve,
} from 'waldur-js-client';

import { OnboardingJustificationDetails } from '@/administration/organizations/OnboardingJustificationDetails';
import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';

export const UserOnboardingJustificationDetailsPage = () => {
  const {
    params: { uuid },
  } = useCurrentStateAndParams();
  const { showErrorResponse } = useNotify();
  const [justification, setJustification] =
    useState<OnboardingJustification>(null);
  const [verification, setVerification] =
    useState<OnboardingVerification>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!uuid) return;
    setLoading(true);
    try {
      const verificationResponse = await onboardingVerificationsRetrieve({
        path: { uuid },
      });
      setVerification(verificationResponse.data);

      if (
        verificationResponse.data.justifications &&
        verificationResponse.data.justifications.length > 0
      ) {
        setJustification(verificationResponse.data.justifications[0]);
      } else {
        setJustification(null);
      }
    } catch (error) {
      showErrorResponse(
        error,
        translate('Unable to load verification details.'),
      );
    } finally {
      setLoading(false);
    }
  }, [uuid]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <OnboardingJustificationDetails
      justification={justification}
      verification={verification}
      loading={loading}
      readOnly
    />
  );
};
