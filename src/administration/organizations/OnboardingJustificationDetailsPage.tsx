import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  OnboardingJustification,
  OnboardingVerification,
  onboardingJustificationsApprove,
  onboardingJustificationsReject,
  onboardingJustificationsRetrieve,
  onboardingVerificationsCreateCustomer,
  onboardingVerificationsRetrieve,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { OnboardingJustificationDetails } from './OnboardingJustificationDetails';

export const OnboardingJustificationDetailsPage = () => {
  const {
    params: { uuid },
  } = useCurrentStateAndParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const [justification, setJustification] =
    useState<OnboardingJustification>(null);
  const [verification, setVerification] =
    useState<OnboardingVerification>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!uuid) return;
    setLoading(true);
    try {
      // Try to fetch as justification first
      try {
        const justificationResponse = await onboardingJustificationsRetrieve({
          path: { uuid },
        });
        setJustification(justificationResponse.data);

        if (justificationResponse.data.verification_uuid) {
          const verificationResponse = await onboardingVerificationsRetrieve({
            path: { uuid: justificationResponse.data.verification_uuid },
          });
          setVerification(verificationResponse.data);
        } else {
          setVerification(null);
        }
      } catch (justificationError: any) {
        // If justification not found, try as verification UUID
        if (
          justificationError?.status === 404 ||
          justificationError?.response?.status === 404
        ) {
          const verificationResponse = await onboardingVerificationsRetrieve({
            path: { uuid },
          });
          setVerification(verificationResponse.data);
          // Check if verification has justifications
          if (
            verificationResponse.data.justifications &&
            verificationResponse.data.justifications.length > 0
          ) {
            setJustification(verificationResponse.data.justifications[0]);
          } else {
            setJustification(null);
          }
        } else {
          throw justificationError;
        }
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
    fetchData();
  }, [fetchData]);

  const handleApprove = async (formValues) => {
    if (!justification) {
      return;
    }
    setActionLoading(true);
    try {
      await waitForConfirmation(
        dispatch,
        translate('Approve justification'),
        translate(
          'Are you sure you want to approve this onboarding justification? This will create the organization automatically.',
        ),
      );

      await onboardingJustificationsApprove({
        path: { uuid: justification.uuid },
        body: { staff_notes: formValues.staff_notes },
      });
      await onboardingVerificationsCreateCustomer({
        path: { uuid: justification.verification_uuid },
      });
      dispatch(
        showSuccess(
          translate(
            'Onboarding justification approved. Organization created successfully.',
          ),
        ),
      );
      router.stateService.go('support-onboarding', { tab: 'justifications' });
    } catch (e) {
      dispatch(
        showErrorResponse(
          e,
          translate('Unable to complete onboarding approval.'),
        ),
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (formValues) => {
    if (!justification) {
      return;
    }
    setActionLoading(true);
    try {
      await waitForConfirmation(
        dispatch,
        translate('Reject justification'),
        translate(
          'Are you sure you want to reject this onboarding justification?',
        ),
      );

      await onboardingJustificationsReject({
        path: { uuid: justification.uuid },
        body: { staff_notes: formValues.staff_notes },
      });
      dispatch(
        showSuccess(translate('Onboarding justification has been rejected.')),
      );
      router.stateService.go('support-onboarding', { tab: 'justifications' });
    } catch (e) {
      dispatch(
        showErrorResponse(
          e,
          translate('Unable to reject onboarding justification.'),
        ),
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <OnboardingJustificationDetails
      justification={justification}
      verification={verification}
      loading={loading}
      actionLoading={actionLoading}
      onApprove={handleApprove}
      onReject={handleReject}
    />
  );
};
