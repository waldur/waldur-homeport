import { useCurrentStateAndParams } from '@uirouter/react';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  OnboardingJustification,
  OnboardingVerification,
  onboardingJustificationsList,
  onboardingJustificationsRetrieve,
  onboardingVerificationsRetrieve,
} from 'waldur-js-client';

import { OnboardingJustificationDetails } from '@waldur/administration/organizations/OnboardingJustificationDetails';
import { translate } from '@waldur/i18n';
import { showError, showErrorResponse } from '@waldur/store/notify';

export const UserOnboardingJustificationDetailsPage = () => {
  const {
    params: { uuid },
  } = useCurrentStateAndParams();
  const dispatch = useDispatch();
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

      const justificationsResponse = await onboardingJustificationsList({});
      const matchedJustification = justificationsResponse.data.find(
        (item) => item.verification_uuid === uuid,
      );

      if (matchedJustification) {
        const detailedJustification = await onboardingJustificationsRetrieve({
          path: { uuid: matchedJustification.uuid },
        });
        setJustification(detailedJustification.data);
      } else {
        setJustification(null);
        dispatch(
          showError(
            translate('No justification was found for this verification.'),
          ),
        );
      }
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate('Unable to load verification details.'),
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [uuid, dispatch]);

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
