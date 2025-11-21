import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { Card, Col, Form as BootstrapForm, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
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

import { ChecklistQuestionField } from './ChecklistQuestionField';
import { QuestionWithMetadata } from './utils';

interface OrganizationCreateStep2Props extends WizardFormStepProps {
  getChecklistData?: () => Promise<{
    allQuestions: any[];
    customerQuestions: any[];
    intentQuestions: any[];
    checklistUuid: string;
  }>;
}

export const OrganizationCreateStep2: FunctionComponent<
  OrganizationCreateStep2Props
> = (props) => {
  const dispatch = useDispatch();

  const selector = formValueSelector(props.form);
  const formAddMethod = useSelector((state) => selector(state, 'addMethod'));
  const uploadedFiles =
    useSelector((state) => selector(state, 'uploadedFiles')) || [];

  const [addMethod, setAddMethod] = useState<'auto' | 'manual'>(
    formAddMethod || 'manual',
  );
  const [checklistQuestions, setChecklistQuestions] = useState<
    QuestionWithMetadata[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [checklistFetched, setChecklistFetched] = useState(false);

  useEffect(() => {
    dispatch(change(props.form, 'addMethod', addMethod));
  }, [addMethod, dispatch, props.form]);

  useEffect(() => {
    if (formAddMethod && formAddMethod !== addMethod) {
      setAddMethod(formAddMethod);
    }
  }, [formAddMethod]);

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

  useEffect(() => {
    if (checklistFetched) return;

    const fetchChecklist = async () => {
      setLoading(true);
      try {
        const data = await props.getChecklistData();
        setChecklistQuestions(data.customerQuestions);
        setChecklistFetched(true);
      } catch {
        setChecklistQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChecklist();
  }, [checklistFetched, props.getChecklistData]);

  return (
    <WizardForm {...props}>
      <div className="d-flex flex-column gap-5">
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-8">
            <h5 className="mb-6 fw-semibold">
              {translate('How would you like to add your company?')}
            </h5>

            <div className="d-flex flex-row gap-4 mb-6">
              <BootstrapForm.Check
                type="radio"
                id="add-auto"
                name="addMethod"
                checked={addMethod === 'auto'}
                onChange={() => setAddMethod('auto')}
                label={
                  <div className="ms-2">
                    <div className="fw-semibold text-gray-800">
                      {translate('Search in registry')}
                    </div>
                    <div className="text-muted small mt-0">
                      {translate(
                        'Find your company in the e-Business Register',
                      )}
                    </div>
                  </div>
                }
                className="form-check-custom"
              />
              <BootstrapForm.Check
                type="radio"
                id="add-manual"
                name="addMethod"
                checked={addMethod === 'manual'}
                onChange={() => setAddMethod('manual')}
                label={
                  <div className="ms-2">
                    <div className="fw-semibold text-gray-800">
                      {translate('Add manually')}
                    </div>
                    <div className="text-muted small mt-0">
                      {translate('Enter company details manually')}
                    </div>
                  </div>
                }
                className="form-check-custom"
              />
            </div>

            {addMethod === 'manual' ? (
              <div className="pt-6">
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

                {loading && <LoadingSpinner />}

                {!loading && checklistQuestions.length > 0 && (
                  <div className="pt-4">
                    {checklistQuestions.map((question) => (
                      <ChecklistQuestionField
                        key={question.uuid}
                        question={question}
                      />
                    ))}
                  </div>
                )}

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
            ) : (
              <>
                <Field
                  name="registration_code"
                  label={translate('Registration code')}
                  placeholder={translate('12345678')}
                  component={FormGroup}
                  required
                  validate={required}
                >
                  <StringField />
                </Field>

                {!loading && checklistQuestions.length > 0 && (
                  <div className="pt-4">
                    {checklistQuestions.map((question) => (
                      <ChecklistQuestionField
                        key={question.uuid}
                        question={question}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </Card.Body>
        </Card>
      </div>
    </WizardForm>
  );
};
