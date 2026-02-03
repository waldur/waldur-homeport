import { CheckCircleIcon, InfoIcon } from '@phosphor-icons/react';
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { Card, Col, Form as BootstrapForm, Row } from 'react-bootstrap';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { change, Field, formValueSelector } from 'redux-form';

import { ACCEPTED_FILE_TYPES } from '@waldur/core/constants';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import {
  composeValidators,
  getNameFieldValidators,
  required,
} from '@waldur/core/validators';
import { StringField } from '@waldur/form';
import { FormGroup } from '@waldur/form/FormGroup';
import { AttachmentItemPending } from '@waldur/form/upload/AttachmentItemPending';
import { AttachmentsList } from '@waldur/form/upload/AttachmentsList';
import { AttachmentUploading } from '@waldur/form/upload/types';
import { UploadContainer } from '@waldur/form/upload/UploadContainer';
import { WizardForm, WizardFormStepProps } from '@waldur/form/WizardForm';
import { translate } from '@waldur/i18n';
import { useUser } from '@waldur/workspace/hooks';

import { ChecklistQuestionField } from './ChecklistQuestionField';
import { getAuthMethodInfo } from './constants';
import {
  PersonIdentifierFieldConfig,
  PersonIdentifierFieldsRenderer,
} from './PersonIdentifierFieldsRenderer';
import { QuestionWithMetadata } from './utils';

interface OrganizationCreateStep2Props extends WizardFormStepProps {
  getChecklistData?: () => Promise<{
    allQuestions: any[];
    customerQuestions: any[];
    intentQuestions: any[];
    checklistCustomerUuid: string;
    checklistIntentUuid: string;
  }>;
}

export const OrganizationCreateStep2: FunctionComponent<
  OrganizationCreateStep2Props
> = (props) => {
  const dispatch = useDispatch();
  const user = useUser();

  const selector = formValueSelector(props.form);
  const formValidationMethod = useSelector((state) =>
    selector(state, 'validationMethod'),
  );
  const fieldConfig = useSelector((state) =>
    selector(state, 'personIdentifierFieldConfig'),
  ) as PersonIdentifierFieldConfig | null;
  const uploadedFiles =
    useSelector((state) => selector(state, 'uploadedFiles')) || [];

  const [validationMethod, setValidationMethod] = useState<string>(
    formValidationMethod || '',
  );
  const isManual = validationMethod === 'manual';
  const [checklistQuestions, setChecklistQuestions] = useState<
    QuestionWithMetadata[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [checklistFetched, setChecklistFetched] = useState(false);

  useEffect(() => {
    if (formValidationMethod && formValidationMethod !== validationMethod) {
      setValidationMethod(formValidationMethod);
    }
  }, [formValidationMethod]);

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

  const updateUploadedFiles = useCallback(
    (files: AttachmentUploading[]) => {
      dispatch(change(props.form, 'uploadedFiles', files));
    },
    [dispatch, props.form],
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
  const allFormValues = useSelector((state) => {
    const questionFields = checklistQuestions.reduce(
      (acc, q) => {
        acc[`question_${q.uuid}`] = selector(state, `question_${q.uuid}`);
        return acc;
      },
      {} as Record<string, any>,
    );
    return questionFields;
  }, shallowEqual);

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
    <WizardForm {...props}>
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
                      <Field
                        name="registration_code"
                        label={translate('Company registration code')}
                        placeholder={translate('12345678')}
                        component={FormGroup}
                        required
                        validate={required}
                        description={translate(
                          'The official registration number of your company',
                        )}
                      >
                        <StringField />
                      </Field>
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
                    <Field
                      name="name"
                      label={translate('Organization name')}
                      placeholder={translate('e.g., Acme Corporation')}
                      maxLength={150}
                      validate={composeValidators(...getNameFieldValidators())}
                      required={true}
                      component={FormGroup}
                    >
                      <StringField />
                    </Field>
                  </Col>
                  <Col md={6}>
                    <Field
                      name="registration_code"
                      label={translate('Registration code')}
                      placeholder={translate('12345678')}
                      component={FormGroup}
                    >
                      <StringField />
                    </Field>
                  </Col>
                </Row>

                {renderChecklistQuestions()}

                {/* Documentation Upload Section */}
                <div className="mt-8">
                  <BootstrapForm.Group>
                    <BootstrapForm.Label className="fs-6 fw-semibold mb-2">
                      {translate(
                        'Optional information and supporting documents',
                      )}
                    </BootstrapForm.Label>
                    <UploadContainer
                      onDrop={handleFileDrop}
                      message={translate(
                        'JPG, PNG, PDF or .asice (max {size})',
                        {
                          size: '2 GB',
                        },
                      )}
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
    </WizardForm>
  );
};
