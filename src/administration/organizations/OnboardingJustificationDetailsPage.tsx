import { CheckCircleIcon, XCircleIcon } from '@phosphor-icons/react';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Col, Form as BootstrapForm, Row } from 'react-bootstrap';
import { Field as FormField, Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import {
  OnboardingJustification,
  OnboardingVerification,
  onboardingJustificationsApprove,
  onboardingJustificationsReject,
  onboardingJustificationsRetrieve,
  onboardingVerificationsCreateCustomer,
  onboardingVerificationsList,
} from 'waldur-js-client';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { AttachmentItem } from '@waldur/form/upload/AttachmentItem';
import { AttachmentsList } from '@waldur/form/upload/AttachmentsList';
import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { Field } from '@waldur/resource/summary';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

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
      const justificationResponse = await onboardingJustificationsRetrieve({
        path: { uuid },
      });
      setJustification(justificationResponse.data);

      // Fetch verification data
      if (justificationResponse.data.verification_uuid) {
        const verificationResponse = await onboardingVerificationsList({});
        const matchedVerification = verificationResponse.data?.find(
          (v) => v.uuid === justificationResponse.data.verification_uuid,
        );
        if (matchedVerification) {
          setVerification(matchedVerification);
        }
      }
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to load justification.')),
      );
    } finally {
      setLoading(false);
    }
  }, [uuid, dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApprove = async (formValues) => {
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
      router.stateService.go('admin-onboarding', { tab: 'justifications' });
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
      router.stateService.go('admin-onboarding', { tab: 'justifications' });
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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!justification) {
    return null;
  }

  const isPending = justification.validation_decision === 'pending';

  return (
    <Form
      onSubmit={() => {}}
      initialValues={{ staff_notes: justification.staff_notes || '' }}
      render={({ handleSubmit, values }) => (
        <form onSubmit={handleSubmit}>
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="d-flex align-items-center gap-3">
              <h1 className="mb-0 ml-2">{justification.legal_name}</h1>
            </div>
            <div className="d-flex gap-2">
              <Button
                variant="danger"
                onClick={() => handleReject(values)}
                disabled={!isPending || actionLoading}
              >
                <XCircleIcon className="me-1" weight="bold" />
                {translate('Reject')}
              </Button>
              <Button
                variant="primary"
                onClick={() => handleApprove(values)}
                disabled={!isPending || actionLoading}
              >
                <CheckCircleIcon className="me-1" weight="bold" />
                {translate('Approve')}
              </Button>
            </div>
          </div>

          <Card className="mb-4">
            <Card.Body>
              <h3 className="mb-4">
                {translate("User's organization details")}
              </h3>
              <hr className="my-4" />

              <h4 className="fw-bold mb-3">{translate('Organization info')}</h4>
              {verification?.user_submitted_customer_data &&
                Object.entries(verification.user_submitted_customer_data).map(
                  ([key, value]) => (
                    <Field key={key} label={key} value={String(value || '—')} />
                  ),
                )}

              <hr className="my-4" />

              <h4 className="fw-bold mb-3">{translate('User answers')}</h4>
              {verification?.onboarding_metadata &&
                Object.entries(verification.onboarding_metadata).map(
                  ([key, value]) => (
                    <Field key={key} label={key} value={String(value || '—')} />
                  ),
                )}

              {justification.supporting_documentation &&
                justification.supporting_documentation.length > 0 && (
                  <>
                    <hr className="my-4" />

                    <h4 className="fw-bold mb-3">
                      {translate('Attached documents')}
                    </h4>
                    <Row className="mb-3">
                      {justification.supporting_documentation.map(
                        (doc, index) => (
                          <Col key={index} xs={12} md={6}>
                            <AttachmentsList
                              attachments={[doc]}
                              ItemComponent={({ attachment }) => (
                                <AttachmentItem
                                  attachment={attachment}
                                  iconSize={24}
                                />
                              )}
                            />
                          </Col>
                        ),
                      )}
                    </Row>
                  </>
                )}

              {(justification.error_message ||
                justification.error_traceback) && (
                <>
                  <hr className="my-4" />

                  <h4 className="fw-bold mb-3">
                    {translate('Automatic validation logs')}
                  </h4>
                  <Field
                    label={translate('Error code')}
                    value={justification.error_message}
                  />
                  <Field
                    label={translate('Traceback')}
                    value={justification.error_traceback}
                  />
                </>
              )}

              <hr className="my-4" />

              <h4 className="fw-bold mb-3">{translate('Notes')}</h4>
              <Row className="mb-3">
                <Col xs={12} md={6}>
                  <FormField name="staff_notes">
                    {({ input }) => (
                      <BootstrapForm.Control
                        {...input}
                        as="textarea"
                        rows={3}
                        placeholder={translate('Enter a description...')}
                        disabled={!isPending}
                        style={{ color: 'inherit' }}
                      />
                    )}
                  </FormField>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </form>
      )}
    />
  );
};
