import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { useCallback, useEffect, useState } from 'react';
import {
  OnboardingJustification,
  OnboardingVerification,
  onboardingJustificationsApprove,
  onboardingJustificationsReject,
  onboardingJustificationsRetrieve,
  onboardingVerificationsCreateCustomer,
  onboardingVerificationsRetrieve,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';

import { OnboardingJustificationDetails } from './OnboardingJustificationDetails';

export const OnboardingJustificationDetailsPage = () => {
  const {
    params: { uuid },
  } = useCurrentStateAndParams();
  const router = useRouter();

  const { showErrorResponse } = useNotify();

  const [justification, setJustification] =
    useState<OnboardingJustification>(null);
  const [verification, setVerification] =
    useState<OnboardingVerification>(null);
  const [loading, setLoading] = useState(true);

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
      showErrorResponse(
        error,
        translate('Unable to load verification details.'),
      );
    } finally {
      setLoading(false);
    }
  }, [uuid]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const { mutate: approve, isPending: approvePending } = useManagedMutation<
    any,
    any,
    any
  >({
    mutationFn: async (formValues) => {
      await onboardingJustificationsApprove({
        path: { uuid: justification.uuid },
        body: { staff_notes: formValues.staff_notes },
      });
      return await onboardingVerificationsCreateCustomer({
        path: { uuid: justification.verification_uuid },
      });
    },
    confirmation: {
      title: translate('Approve justification'),
      body: translate(
        'Are you sure you want to approve this onboarding justification? This will create the organization automatically.',
      ),
    },
    successMessage: translate(
      'Onboarding justification approved. Organization created successfully.',
    ),
    errorMessage: translate('Unable to complete onboarding approval.'),
    onSuccess: () => {
      router.stateService.go('support-onboarding', { tab: 'justifications' });
    },
  });

  const { mutate: reject, isPending: rejectPending } = useManagedMutation<
    any,
    any,
    any
  >({
    mutationFn: (formValues) =>
      onboardingJustificationsReject({
        path: { uuid: justification.uuid },
        body: { staff_notes: formValues.staff_notes },
      }),
    confirmation: {
      title: translate('Reject justification'),
      body: translate(
        'Are you sure you want to reject this onboarding justification?',
      ),
    },
    successMessage: translate('Onboarding justification has been rejected.'),
    errorMessage: translate('Unable to reject onboarding justification.'),
    onSuccess: () => {
      router.stateService.go('support-onboarding', { tab: 'justifications' });
    },
  });

  return (
    <OnboardingJustificationDetails
      justification={justification}
      verification={verification}
      loading={loading}
      actionLoading={approvePending || rejectPending}
      onApprove={approve}
      onReject={reject}
    />
  );
};
