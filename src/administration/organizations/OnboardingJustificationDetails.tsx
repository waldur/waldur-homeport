import { CheckCircleIcon, XCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Field as FormField, Form } from 'react-final-form';
import {
  OnboardingJustification,
  OnboardingVerification,
} from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { BaseTextField } from '@/form/TextField';
import { AttachmentItem } from '@/form/upload/AttachmentItem';
import { AttachmentsList } from '@/form/upload/AttachmentsList';
import { translate } from '@/i18n';
import { Field } from '@/resource/summary';
import { renderFieldOrDash } from '@/table/utils';

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

  if (!justification && !verification) {
    return null;
  }

  const isPending = justification?.validation_decision === 'pending';
  const canEditNotes = isPending && !readOnly;
  const showActions = !readOnly && onApprove && onReject && justification;

  return (
    <Form
      onSubmit={() => {}}
      initialValues={{ staff_notes: justification?.staff_notes || '' }}
      render={({ handleSubmit, values }) => (
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <h1 className="mb-0 ml-2">
                {justification
                  ? `${justification.legal_name} (${justification.legal_person_identifier})`
                  : verification
                    ? `${verification.legal_name || (verification.verified_company_data as any)?.name || ''} (${verification.legal_person_identifier || ''})`
                    : translate('Verification details')}
              </h1>
            </div>
            {showActions && (
              <div className="flex gap-1.5">
                <BaseButton
                  pending={actionLoading}
                  variant="danger"
                  onClick={() => onReject?.(values)}
                  disabled={!isPending}
                  disabledReason={
                    !isPending
                      ? translate('Request has already been processed')
                      : undefined
                  }
                  label={translate('Reject')}
                  iconNode={<XCircleIcon weight="bold" />}
                  size="lg"
                />
                <BaseButton
                  pending={actionLoading}
                  variant="primary"
                  onClick={() => onApprove?.(values)}
                  disabled={!isPending}
                  disabledReason={
                    !isPending
                      ? translate('Request has already been processed')
                      : undefined
                  }
                  label={translate('Approve')}
                  iconNode={<CheckCircleIcon weight="bold" />}
                  size="lg"
                />
              </div>
            )}
          </div>

          <div className="card mb-3">
            <div className="card-body">
              {verification?.user_submitted_customer_data &&
                Object.keys(verification.user_submitted_customer_data).length >
                  0 && (
                  <>
                    <h3 className="mb-3">
                      {translate("User's organization details")}
                    </h3>
                    <hr className="my-3" />

                    <h4 className="font-medium mb-2.5">
                      {translate('Organization info')}
                    </h4>
                    {Object.entries(
                      verification.user_submitted_customer_data,
                    ).map(([key, value]) => (
                      <Field
                        key={key}
                        label={key}
                        value={String(renderFieldOrDash(value))}
                      />
                    ))}

                    <hr className="my-3" />
                  </>
                )}

              {verification?.onboarding_metadata &&
                Object.keys(verification.onboarding_metadata).length > 0 && (
                  <>
                    <h4 className="font-medium mb-2.5">
                      {translate('User answers')}
                    </h4>
                    {Object.entries(verification.onboarding_metadata).map(
                      ([key, value]) => (
                        <Field
                          key={key}
                          label={key}
                          value={String(renderFieldOrDash(value))}
                        />
                      ),
                    )}

                    <hr className="my-3" />
                  </>
                )}

              {justification?.supporting_documentation &&
                justification.supporting_documentation.length > 0 && (
                  <>
                    <h4 className="font-medium mb-2.5">
                      {translate('Attached documents')}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 mb-2.5">
                      {justification.supporting_documentation.map(
                        (doc, index) => (
                          <div key={index}>
                            <AttachmentsList
                              attachments={[doc]}
                              ItemComponent={({ attachment }) => (
                                <AttachmentItem attachment={attachment} />
                              )}
                            />
                          </div>
                        ),
                      )}
                    </div>
                  </>
                )}

              {justification &&
                (justification.error_message ||
                  justification.error_traceback) && (
                  <>
                    <h4 className="font-medium mb-2.5">
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

              {justification && (
                <>
                  <hr className="my-3" />

                  <h4 className="font-medium mb-2.5">{translate('Notes')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 mb-2.5">
                    <div>
                      <FormField name="staff_notes">
                        {({ input }) => (
                          <BaseTextField
                            {...input}

                            rows={3}
                            placeholder={translate('Enter a description...')}
                            disabled={!canEditNotes}
                            style={{ color: 'inherit' }}
                          />
                        )}
                      </FormField>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </form>
      )}
    />
  );
};
