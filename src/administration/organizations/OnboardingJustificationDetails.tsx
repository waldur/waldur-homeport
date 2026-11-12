import { CheckCircleIcon, XCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Field as FormField, Form } from 'react-final-form';
import {
  OnboardingJustification,
  OnboardingVerification,
} from 'waldur-js-client';

import {
  BaseButton,
  PropertyItem,
  PropertyList,
  Card,
  CardContent,
} from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { BaseTextField } from '@/form/TextField';
import { AttachmentItem } from '@/form/upload/AttachmentItem';
import { AttachmentsList } from '@/form/upload/AttachmentsList';
import { translate } from '@/i18n';
import { ROW_SECTIONS_CLASS, RowSection } from '@/proposals/ExpandableRowParts';
import { renderFieldOrDash } from '@/table/utils';

const hasEntries = (data?: object | null) =>
  Boolean(data && Object.keys(data).length > 0);

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

          <Card className="mb-3">
            <CardContent className={ROW_SECTIONS_CLASS}>
              {hasEntries(verification?.user_submitted_customer_data) && (
                <RowSection title={translate('Organization info')}>
                  <PropertyList variant="summary" space={1.5}>
                    {Object.entries(
                      verification.user_submitted_customer_data,
                    ).map(([key, value]) => (
                      <PropertyItem
                        key={key}
                        label={key}
                        value={String(renderFieldOrDash(value))}
                      />
                    ))}
                  </PropertyList>
                </RowSection>
              )}

              {hasEntries(verification?.onboarding_metadata) && (
                <RowSection title={translate('User answers')}>
                  <PropertyList variant="summary" space={1.5}>
                    {Object.entries(verification.onboarding_metadata).map(
                      ([key, value]) => (
                        <PropertyItem
                          key={key}
                          label={key}
                          value={String(renderFieldOrDash(value))}
                        />
                      ),
                    )}
                  </PropertyList>
                </RowSection>
              )}

              {justification?.supporting_documentation?.length > 0 && (
                <RowSection title={translate('Attached documents')}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
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
                </RowSection>
              )}

              {justification &&
                (justification.error_message ||
                  justification.error_traceback) && (
                  <RowSection title={translate('Automatic validation logs')}>
                    <PropertyList variant="summary" space={1.5}>
                      <PropertyItem
                        label={translate('Error code')}
                        value={justification.error_message}
                      />
                      <PropertyItem
                        label={translate('Traceback')}
                        value={justification.error_traceback}
                      />
                    </PropertyList>
                  </RowSection>
                )}

              {justification && (
                <RowSection title={translate('Notes')}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
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
                </RowSection>
              )}
            </CardContent>
          </Card>
        </form>
      )}
    />
  );
};
