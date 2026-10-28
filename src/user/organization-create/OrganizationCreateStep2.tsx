import {
  CheckCircleIcon,
  ClockCountdownIcon,
  InfoIcon,
} from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useForm, useFormState } from 'react-final-form';

import { BaseButton, FormField, FormLabel } from 'waldur-ui';

import { ACCEPTED_FILE_TYPES } from '@/core/constants';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import {
  composeValidators,
  getNameFieldValidators,
  required,
} from '@/core/validators';
import { StringGroup } from '@/form';
import { AttachmentItemPending } from '@/form/upload/AttachmentItemPending';
import { AttachmentsList } from '@/form/upload/AttachmentsList';
import { AttachmentUploading } from '@/form/upload/types';
import { UploadContainer } from '@/form/upload/UploadContainer';
import { translate } from '@/i18n';
import { useUser } from '@/workspace/hooks';

import { ChecklistQuestionField } from './ChecklistQuestionField';
import { getAuthMethodInfo } from './constants';
import {
  PersonIdentifierFieldConfig,
  PersonIdentifierFieldsRenderer,
} from './PersonIdentifierFieldsRenderer';
import { OrganizationCreateFormValues } from './types';
import { isIdentityFromAccount, QuestionWithMetadata } from './utils';

interface OrganizationCreateStep2Props {
  getChecklistData?: () => Promise<{
    allQuestions: any[];
    customerQuestions: any[];
    intentQuestions: any[];
    checklistCustomerUuid: string;
    checklistIntentUuid: string;
  }>;
  onSubmitDisabledChange?: (disabled: boolean, reason?: string) => void;
}

export const OrganizationCreateStep2: FunctionComponent<
  OrganizationCreateStep2Props
> = (props) => {
  const { onSubmitDisabledChange } = props;
  const form = useForm();
  const router = useRouter();
  const { values } = useFormState<OrganizationCreateFormValues>({
    subscription: { values: true },
  });
  const user = useUser();

  const validationMethod = values.validationMethod || '';
  const fieldConfig = values.personIdentifierFieldConfig || null;
  const uploadedFiles = values.uploadedFiles || [];

  const isManual = validationMethod === 'manual';
  const [checklistQuestions, setChecklistQuestions] = useState<
    QuestionWithMetadata[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [checklistFetched, setChecklistFetched] = useState(false);

  // Check if user already has required fields based on validation method
  const hasRequiredFields = () => {
    if (!fieldConfig || !fieldConfig.person_identifier_fields || !user)
      return false;

    if (fieldConfig.person_identifier_fields.type === 'string') {
      const fieldName = fieldConfig.person_identifier_fields.field;
      return !!user[fieldName];
    } else if (fieldConfig.person_identifier_fields.type === 'object') {
      const requiredFields = Object.keys(
        fieldConfig.person_identifier_fields.fields,
      );
      return requiredFields.every((fieldName) => !!user[fieldName]);
    }

    return false;
  };

  // D&B (Dun & Bradstreet) methods read the person's identity from the
  // account. A missing name is completed on the profile, where names are
  // always editable (and D&B Denmark only reads them from the account). Any
  // other missing field — e.g. date of birth, which the profile may hide — is
  // asked for here; the rest of the identity is filled from the account when
  // the validation runs.
  const isDnb = validationMethod.startsWith('dnb_');
  const pif = fieldConfig?.person_identifier_fields;
  const missingNameLabels =
    isDnb && pif?.type === 'object' && user
      ? Object.entries(pif.fields)
          .filter(
            ([fieldName]) =>
              ['first_name', 'last_name'].includes(fieldName) &&
              !user[fieldName],
          )
          .map(([, spec]) => spec.label)
      : [];
  const missingProfileLabels = missingNameLabels.join(', ');

  // An identity entered here, or one the user can edit in their profile, does
  // not prove who is signed in, so the register check goes to manual review.
  const identityReview =
    !isManual &&
    !isIdentityFromAccount(fieldConfig, user) &&
    missingNameLabels.length === 0;

  const getMissingFieldsConfig = (): PersonIdentifierFieldConfig | null =>
    isDnb && pif?.type === 'object'
      ? {
          ...fieldConfig,
          person_identifier_fields: {
            ...pif,
            fields: Object.fromEntries(
              Object.entries(pif.fields).filter(
                ([fieldName]) => !user?.[fieldName],
              ),
            ),
          },
        }
      : fieldConfig;

  // Block advancing while a D&B name is missing from the profile.
  // The reason travels to the footer button so the disabled Next explains why.
  const blockForIncompleteProfile = missingNameLabels.length > 0;
  useEffect(() => {
    onSubmitDisabledChange?.(
      blockForIncompleteProfile,
      blockForIncompleteProfile
        ? translate('Complete your profile to continue.')
        : undefined,
    );
  }, [blockForIncompleteProfile, onSubmitDisabledChange]);

  const updateUploadedFiles = useCallback(
    (files: AttachmentUploading[]) => {
      form.change('uploadedFiles', files);
    },
    [form],
  );

  const handleFileDrop = useCallback(
    (files: File[]) => {
      const newUploads = files.map<AttachmentUploading>((file) => ({
        key: file.size,
        file,
        progress: null,
        error: null,
      }));
      updateUploadedFiles([...uploadedFiles, ...newUploads]);
    },
    [uploadedFiles, updateUploadedFiles],
  );

  const handleFileCancel = useCallback(
    (file) => {
      updateUploadedFiles(
        uploadedFiles.filter((item) => item.key !== file.size),
      );
    },
    [uploadedFiles, updateUploadedFiles],
  );

  // Get all form values for dependency evaluation
  const allFormValues = checklistQuestions.reduce(
    (acc, q) => {
      const key = `question_${q.uuid}`;
      acc[key] = values[key];
      return acc;
    },
    {} as Record<string, any>,
  );

  // Render checklist questions in a responsive grid layout
  const renderChecklistQuestions = () => {
    if (loading) return <LoadingSpinner />;
    if (checklistQuestions.length === 0) return null;

    return (
      <div className="grid grid-cols-1 gap-3 pt-3 md:grid-cols-2">
        {checklistQuestions.map((question, index) => {
          const isLastOdd =
            checklistQuestions.length % 2 !== 0 &&
            index === checklistQuestions.length - 1;
          return (
            <div
              className={isLastOdd ? 'md:col-span-2' : undefined}
              key={question.uuid}
            >
              <ChecklistQuestionField
                question={question}
                allQuestions={checklistQuestions}
                formValues={allFormValues}
              />
            </div>
          );
        })}
      </div>
    );
  };

  // Documents go to the review: they are attached to the justification.
  const renderDocumentUpload = () => (
    <div className="mt-6">
      <FormField>
        <FormLabel className="mb-1.5">
          {translate('Optional information and supporting documents')}
        </FormLabel>
        <UploadContainer
          onDrop={handleFileDrop}
          message={translate('JPG, PNG, PDF or .asice (max {size})', {
            size: '2 GB',
          })}
          multiple={true}
          maxSize={2 * 1024 * 1024 * 1024} // 2GB
          accept={ACCEPTED_FILE_TYPES}
        />
        <AttachmentsList
          uploading={uploadedFiles}
          className="mt-3"
          ItemPendingComponent={(itemProps) => (
            <AttachmentItemPending {...itemProps} onCancel={handleFileCancel} />
          )}
        />
        <p className="mb-0 mt-1 text-quaternary small">
          {translate(
            'To speed up the review process, provide as much data as possible',
          )}
        </p>
      </FormField>
    </div>
  );

  // Reset checklist fetched flag when validation method changes
  useEffect(() => {
    setChecklistFetched(false);
  }, [isManual]);

  useEffect(() => {
    if (checklistFetched) return;

    const fetchChecklist = async () => {
      if (!props.getChecklistData) {
        return;
      }

      setLoading(true);
      try {
        const data = await props.getChecklistData();
        // For manual validation: show customer questions
        // For automatic validation: show NO questions in Step 2 (intent questions in Step 4)
        if (isManual) {
          setChecklistQuestions(data.customerQuestions);
        } else {
          setChecklistQuestions([]);
        }
        setChecklistFetched(true);
      } catch {
        setChecklistQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChecklist();
  }, [checklistFetched, isManual]);

  return (
    <div className="flex flex-col gap-4">
      <div className="card border-0 shadow-sm">
        <div className="card-body p-6">
          {!isManual &&
            (() => {
              const methodInfo = getAuthMethodInfo(validationMethod);

              return (
                <>
                  <p className="mb-2.5">{methodInfo.title}</p>
                  {hasRequiredFields() ? (
                    <div className="card card-bordered mb-5">
                      <div className="card-body flex gap-2.5">
                        <div className="shrink-0">
                          <CheckCircleIcon
                            size={24}
                            weight="duotone"
                            className="text-success"
                          />
                        </div>
                        <div className="grow">
                          <div className="text-primary mb-1">
                            {translate('Personal identity received')}
                            {user?.civil_number && `: ${user.civil_number}`}
                          </div>
                          <div className="text-secondary">
                            {translate(
                              'This will be used to check your company representative rights.',
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : blockForIncompleteProfile ? (
                    <div className="card card-bordered mb-3">
                      <div className="card-body flex gap-2.5">
                        <div className="shrink-0">
                          <InfoIcon size={24} weight="duotone" />
                        </div>
                        <div className="grow">
                          <div className="text-primary mb-1">
                            {translate('Complete your profile to continue')}
                          </div>
                          <div className="text-secondary mb-2.5">
                            {missingProfileLabels
                              ? translate(
                                  'This check uses your identity from your account, but your profile is missing: {attributes}. Add it to your profile to continue.',
                                  { attributes: missingProfileLabels },
                                )
                              : translate(
                                  'This check uses your identity from your account. Complete your profile to continue.',
                                )}
                          </div>
                          <BaseButton
                            variant="primary"
                            size="sm"
                            onClick={() =>
                              router.stateService.go('profile-manage')
                            }
                            label={translate('Complete profile')}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="card card-bordered mb-3">
                        <div className="card-body flex gap-2.5">
                          <div className="shrink-0">
                            <InfoIcon size={24} weight="duotone" />
                          </div>
                          <div className="grow">
                            <div className="text-primary mb-1">
                              {translate('Why do we need this?')}
                            </div>
                            <div className="text-secondary">
                              {methodInfo.description}
                            </div>
                          </div>
                        </div>
                      </div>

                      {fieldConfig && (
                        <PersonIdentifierFieldsRenderer
                          fieldConfig={getMissingFieldsConfig()}
                          loading={false}
                        />
                      )}
                    </>
                  )}
                  {identityReview && (
                    <div className="card card-bordered mb-3">
                      <div className="card-body flex gap-2.5">
                        <div className="shrink-0">
                          <ClockCountdownIcon size={24} weight="duotone" />
                        </div>
                        <div className="grow">
                          <div className="text-primary mb-1">
                            {translate(
                              'Your application will be reviewed manually',
                            )}
                          </div>
                          <div className="text-secondary">
                            {translate(
                              'Your identity is not confirmed by your login: it is entered here or can be edited in your profile. The business register is still checked, but staff review your application before the organization is created. To be verified automatically, sign in with a service that confirms your identity, such as a national eID.',
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Registration code field for automatic validation */}
                  <div className="mt-5">
                    <StringGroup
                      name="registration_code"
                      label={translate('Company registration code')}
                      placeholder={translate('12345678')}
                      required
                      validate={required}
                      description={translate(
                        'The official registration number of your company',
                      )}
                    />
                  </div>
                  {renderChecklistQuestions()}
                  {identityReview && renderDocumentUpload()}
                </>
              );
            })()}

          {isManual && (
            <div className="pt-1.5">
              <p className="text-secondary mb-5">
                {translate(
                  'Please provide your organization details. Supporting documents will help speed up the review process.',
                )}
              </p>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <StringGroup
                    name="name"
                    label={translate('Organization name')}
                    placeholder={translate('e.g., Acme Corporation')}
                    maxLength={150}
                    validate={composeValidators(...getNameFieldValidators())}
                    required={true}
                  />
                </div>
                <div>
                  <StringGroup
                    name="registration_code"
                    label={translate('Registration code')}
                    placeholder={translate('12345678')}
                  />
                </div>
              </div>

              {renderChecklistQuestions()}

              {renderDocumentUpload()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
