import { CheckCircleIcon, InfoIcon } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { Form as BootstrapForm, Card, Col, Row } from 'react-bootstrap';
import { useForm, useFormState } from 'react-final-form';

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
import { PersonIdentifierFieldsRenderer } from './PersonIdentifierFieldsRenderer';
import { OrganizationCreateFormValues } from './types';
import { QuestionWithMetadata } from './utils';

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

  // D&B (Dun & Bradstreet) methods source the person's identity — name, date
  // of birth, personnummer — from the user's account (populated by the eID
  // login / profile), never from a form field the applicant types. So instead
  // of the editable fallback, an incomplete profile must be completed first.
  const isDnb = validationMethod.startsWith('dnb_');

  // Labels of the account fields the current method needs but the profile is
  // missing — shown so the user knows exactly what to add to their profile.
  const getMissingProfileLabels = (): string[] => {
    const pif = fieldConfig?.person_identifier_fields;
    if (!pif || !user) return [];
    if (pif.type === 'string') {
      return user[pif.field] ? [] : [pif.label];
    }
    if (pif.type === 'object') {
      return Object.entries(pif.fields)
        .filter(([fieldName]) => !user[fieldName])
        .map(([, spec]) => spec.label);
    }
    return [];
  };
  const missingProfileLabels = getMissingProfileLabels().join(', ');

  // Block advancing while a D&B profile is incomplete: the account can't yet
  // supply the required identity, and there is no form field to fall back on.
  // The reason travels to the footer button so the disabled Next explains why.
  const blockForIncompleteProfile = isDnb && !hasRequiredFields();
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
      <Row className="g-4 pt-4">
        {checklistQuestions.map((question, index) => {
          const isLastOdd =
            checklistQuestions.length % 2 !== 0 &&
            index === checklistQuestions.length - 1;
          return (
            <Col md={isLastOdd ? 12 : 6} key={question.uuid}>
              <ChecklistQuestionField
                question={question}
                allQuestions={checklistQuestions}
                formValues={allFormValues}
              />
            </Col>
          );
        })}
      </Row>
    );
  };

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
    <div className="d-flex flex-column gap-5">
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-8">
          {!isManual &&
            (() => {
              const methodInfo = getAuthMethodInfo(validationMethod);

              return (
                <>
                  <p className="mb-3">{methodInfo.title}</p>
                  {hasRequiredFields() ? (
                    <Card className="card-bordered mb-6">
                      <Card.Body className="d-flex gap-3">
                        <div className="flex-shrink-0">
                          <CheckCircleIcon
                            size={24}
                            weight="duotone"
                            className="text-success"
                          />
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-semibold text-gray-800 mb-1">
                            {translate('Personal identity received')}
                            {user?.civil_number && `: ${user.civil_number}`}
                          </div>
                          <div className="text-gray-700">
                            {translate(
                              'This will be used to check your company representative rights.',
                            )}
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  ) : isDnb ? (
                    <Card className="card-bordered mb-4">
                      <Card.Body className="d-flex gap-3">
                        <div className="flex-shrink-0">
                          <InfoIcon size={24} weight="duotone" />
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-semibold text-gray-800 mb-1">
                            {translate('Complete your profile to continue')}
                          </div>
                          <div className="text-gray-700 mb-3">
                            {missingProfileLabels
                              ? translate(
                                  'This check uses your identity from your account, but your profile is missing: {attributes}. Add it to your profile to continue.',
                                  { attributes: missingProfileLabels },
                                )
                              : translate(
                                  'This check uses your identity from your account. Complete your profile to continue.',
                                )}
                          </div>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() =>
                              router.stateService.go('profile-manage')
                            }
                          >
                            {translate('Complete profile')}
                          </button>
                        </div>
                      </Card.Body>
                    </Card>
                  ) : (
                    <>
                      <Card className="card-bordered mb-4">
                        <Card.Body className="d-flex gap-3">
                          <div className="flex-shrink-0">
                            <InfoIcon size={24} weight="duotone" />
                          </div>
                          <div className="flex-grow-1">
                            <div className="fw-semibold text-gray-800 mb-1">
                              {translate('Why do we need this?')}
                            </div>
                            <div className="text-gray-700">
                              {methodInfo.description}
                            </div>
                          </div>
                        </Card.Body>
                      </Card>

                      {fieldConfig && (
                        <PersonIdentifierFieldsRenderer
                          fieldConfig={fieldConfig}
                          loading={false}
                        />
                      )}
                    </>
                  )}
                  {/* Registration code field for automatic validation */}
                  <div className="mt-6">
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
                </>
              );
            })()}

          {isManual && (
            <div className="pt-2">
              <p className="text-gray-700 mb-6">
                {translate(
                  'Please provide your organization details. Supporting documents will help speed up the review process.',
                )}
              </p>

              <Row className="g-6">
                <Col md={6}>
                  <StringGroup
                    name="name"
                    label={translate('Organization name')}
                    placeholder={translate('e.g., Acme Corporation')}
                    maxLength={150}
                    validate={composeValidators(...getNameFieldValidators())}
                    required={true}
                  />
                </Col>
                <Col md={6}>
                  <StringGroup
                    name="registration_code"
                    label={translate('Registration code')}
                    placeholder={translate('12345678')}
                  />
                </Col>
              </Row>

              {renderChecklistQuestions()}

              {/* Documentation Upload Section */}
              <div className="mt-8">
                <BootstrapForm.Group>
                  <BootstrapForm.Label className="fs-6 fw-semibold mb-2">
                    {translate('Optional information and supporting documents')}
                  </BootstrapForm.Label>
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
                    className="mt-4"
                    ItemPendingComponent={(itemProps) => (
                      <AttachmentItemPending
                        {...itemProps}
                        onCancel={handleFileCancel}
                      />
                    )}
                  />
                  <p className="mb-0 mt-1 text-muted small">
                    {translate(
                      'To speed up the review process, provide as much data as possible',
                    )}
                  </p>
                </BootstrapForm.Group>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};
