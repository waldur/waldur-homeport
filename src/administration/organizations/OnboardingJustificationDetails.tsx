import { CheckCircleIcon, XCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Button, Card, Col, Form as BootstrapForm, Row } from 'react-bootstrap';
import { Field as FormField, Form } from 'react-final-form';
import {
  OnboardingJustification,
  OnboardingVerification,
} from 'waldur-js-client';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { AttachmentItem } from '@waldur/form/upload/AttachmentItem';
import { AttachmentsList } from '@waldur/form/upload/AttachmentsList';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

interface OnboardingJustificationDetailsProps {
  justification: OnboardingJustification | null;
  verification?: OnboardingVerification | null;
  loading?: boolean;
  actionLoading?: boolean;
  readOnly?: boolean;
  onApprove?: (values: any) => void | Promise<void>;
  onReject?: (values: any) => void | Promise<void>;
}

export const OnboardingJustificationDetails: FC<
  OnboardingJustificationDetailsProps
> = ({
  justification,
  verification,
  loading = false,
  actionLoading = false,
  readOnly = false,
  onApprove,
  onReject,
}) => {
  if (loading) {
    return <LoadingSpinner />;
  }

  if (!justification) {
    return null;
  }

  const isPending = justification.validation_decision === 'pending';
  const canEditNotes = isPending && !readOnly;
  const showActions = !readOnly && onApprove && onReject;

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
            {showActions && (
              <div className="d-flex gap-2">
                <Button
                  variant="danger"
                  onClick={() => onReject?.(values)}
                  disabled={!isPending || actionLoading}
                >
                  <XCircleIcon className="me-1" weight="bold" />
                  {translate('Reject')}
                </Button>
                <Button
                  variant="primary"
                  onClick={() => onApprove?.(values)}
                  disabled={!isPending || actionLoading}
                >
                  <CheckCircleIcon className="me-1" weight="bold" />
                  {translate('Approve')}
                </Button>
              </div>
            )}
          </div>

          <Card className="mb-4">
            <Card.Body>
              {verification?.user_submitted_customer_data &&
                Object.keys(verification.user_submitted_customer_data).length >
                  0 && (
                  <>
                    <h3 className="mb-4">
                      {translate("User's organization details")}
                    </h3>
                    <hr className="my-4" />

                    <h4 className="fw-bold mb-3">
                      {translate('Organization info')}
                    </h4>
                    {Object.entries(
                      verification.user_submitted_customer_data,
                    ).map(([key, value]) => (
                      <Field
                        key={key}
                        label={key}
                        value={String(value || '—')}
                      />
                    ))}

                    <hr className="my-4" />
                  </>
                )}

              {verification?.onboarding_metadata &&
                Object.keys(verification.onboarding_metadata).length > 0 && (
                  <>
                    <h4 className="fw-bold mb-3">
                      {translate('User answers')}
                    </h4>
                    {Object.entries(verification.onboarding_metadata).map(
                      ([key, value]) => (
                        <Field
                          key={key}
                          label={key}
                          value={String(value || '—')}
                        />
                      ),
                    )}

                    <hr className="my-4" />
                  </>
                )}

              {justification.supporting_documentation &&
                justification.supporting_documentation.length > 0 && (
                  <>
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
                        disabled={!canEditNotes}
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
