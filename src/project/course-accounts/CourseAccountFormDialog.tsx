import {
  CaretLeftIcon,
  CaretRightIcon,
  PlusCircleIcon,
} from '@phosphor-icons/react';
import Papa from 'papaparse';
import { FC, useCallback, useMemo, useState } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { Field, Form } from 'react-final-form';
import { useToggle } from 'react-use';
import {
  CourseAccount,
  CourseAccountRequest,
  marketplaceCourseAccountsCreate,
  marketplaceCourseAccountsCreateBulk,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { SubmitButton, TextGroup } from '@/form';
import { EmailField } from '@/form/EmailField';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/notify';
import { ActionButton } from '@/table/ActionButton';
import { ProgressStep, WizardStepIndicator } from '@/wizard';
import { useProject } from '@/workspace/hooks';

import templateFile from './course_accounts_template.json';
import { Step1UploadFile } from './Step1UploadFile';
import { Step2PreviewAndCreate } from './Step2PreviewAndCreate';
import { Step3CreationProgress } from './Step3CreationProgress';
import {
  hasCourseAccountsErrors,
  RawCourseAccount,
  validateCourseAccountCreation,
} from './utils';

interface OwnProps {
  resolve: {
    refetch(): void;
  };
}

const stepsBatch: ProgressStep[] = [
  {
    key: 'upload',
    label: translate('Upload file'),
    completed: false,
  },
  {
    key: 'preview',
    label: translate('Preview & create'),
    completed: false,
  },
  {
    key: 'progress',
    label: translate('Creation progress'),
    completed: false,
  },
];

const MAX_LENGTH = 1000;

const validator = (values) =>
  new Promise((resolve) => {
    if (!values.file?.length)
      resolve({ file: translate('Please import a file.') });

    const file = values.file[0];

    if (file.type !== 'text/csv')
      resolve({ file: translate('Invalid format, please import a .csv file') });

    Papa.parse(file, {
      skipEmptyLines: true,
      complete: function (results: { data: Array<Array<string>> }) {
        let _error = 'invalid';
        if (Array.isArray(results?.data) && Array.isArray(results?.data[0])) {
          const header = results.data[0];
          // Check headers
          if (templateFile.fields.every((field) => header.includes(field))) {
            _error = '';
          }

          // Check empty
          if (!_error && (!results.data[1] || results.data[1]?.length === 0)) {
            _error = 'empty';
          }

          // Check max length
          if (!_error && results.data?.length > MAX_LENGTH + 1) {
            _error = 'max';
          }

          // Check emails
          if (!_error) {
            const emailIdx = header.indexOf('email');
            if (!results.data.slice(1).every((record) => record[emailIdx])) {
              _error = 'email';
            }
          }
        }

        if (_error === 'invalid') {
          resolve({
            file: translate(
              'The imported data format does not match the template format.',
            ),
          });
        } else if (_error === 'empty') {
          resolve({ file: translate('The imported file is empty.') });
        } else if (_error === 'max') {
          resolve({
            file: translate('The number of records exceeds the allowed limit.'),
          });
        } else if (_error === 'email') {
          resolve({
            file: translate(
              'The email is not specified in one or more records.',
            ),
          });
        } else {
          // No error
          resolve('');
        }
      },
    });
  });

export const CourseAccountFormDialog: FC<OwnProps> = ({
  resolve: { refetch },
}) => {
  const project = useProject();

  const { showErrorResponse, showSuccess, showInfo } = useNotify();

  const { closeDialog } = useModal();

  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');
  const [createdAccounts, setCreatedAccounts] = useState<CourseAccount[]>([]);

  const save = useCallback(
    async (
      formData: CourseAccountRequest & {
        /** Data for batch creation */ data?: Array<RawCourseAccount>;
      },
    ) => {
      try {
        if (activeTab === 'single') {
          await marketplaceCourseAccountsCreate({
            body: {
              project: formData.project,
              email: formData.email,
              description: formData.description,
            },
          });
          showSuccess(translate('Course account has been created.'));
        } else {
          const validRecords: RawCourseAccount[] = formData.data.filter(
            (row) => {
              const validate = validateCourseAccountCreation(row);
              return !validate.errors.includes('invalid_email');
            },
          );
          if (!validRecords.length) {
            showInfo(translate('No valid course account to create.'));
            return;
          }
          const response = await marketplaceCourseAccountsCreateBulk({
            body: {
              course_accounts: validRecords,
              project: formData.project,
            },
          });
          setCreatedAccounts(response.data);
          setStep(2);
          showSuccess(
            translate('{n} course accounts have been created.', {
              n: validRecords.length,
            }),
          );
          return;
        }
        closeDialog();
        if (refetch) refetch();
      } catch (e) {
        showErrorResponse(e, translate('Unable to create course account.'));
      }
    },
    [refetch, activeTab],
  );

  // Batch import method
  const [skipErrors, setSkipErrors] = useToggle(false);
  const [step, setStep] = useState(0);
  const isLast = step === stepsBatch.length - 1;
  const nextStep = () => {
    if (isLast) return;
    setStep(step + 1);
  };
  const prevStep = () => (step > 0 ? setStep(step - 1) : null);
  const goToTab = (key) => {
    setActiveTab(key);
    if (key === 'single') setStep(0);
  };

  return (
    <Form
      key={activeTab}
      onSubmit={save}
      initialValues={{ project: project.uuid }}
      validate={activeTab === 'batch' ? validator : undefined}
      render={({ handleSubmit, submitting, invalid, values }) => {
        const hasErrors = useMemo(
          () => hasCourseAccountsErrors(values.data),
          [],
        );

        return (
          <form onSubmit={handleSubmit}>
            <ModalDialog
              title={translate('Create course account')}
              iconNode={<PlusCircleIcon weight="bold" />}
              iconColor="success"
              footer={
                <>
                  {activeTab === 'batch' && step === 1 && (
                    <ActionButton
                      title={translate('Back')}
                      action={prevStep}
                      iconNode={<CaretLeftIcon weight="bold" />}
                      variant="tertiary"
                      className="w-125px me-auto"
                    />
                  )}
                  {activeTab === 'batch' && step === 2 ? (
                    <ActionButton
                      title={translate('Close')}
                      action={() => {
                        if (refetch) refetch();
                        closeDialog();
                      }}
                      variant="primary"
                      className="w-125px"
                    />
                  ) : (
                    <>
                      <CloseDialogButton className="w-125px" />
                      {activeTab === 'batch' && step === 0 ? (
                        <ActionButton
                          title={translate('Next')}
                          action={nextStep}
                          iconNode={<CaretRightIcon weight="bold" />}
                          iconRight
                          disabled={invalid}
                          disabledReason={translate(
                            'Please fill in the required fields',
                          )}
                          variant="primary"
                          className="w-125px"
                        />
                      ) : (
                        <SubmitButton
                          submitting={submitting}
                          disabled={
                            invalid ||
                            (activeTab === 'batch' && hasErrors && !skipErrors)
                          }
                          label={translate('Create')}
                          className="btn btn-primary w-125px"
                        />
                      )}
                    </>
                  )}
                </>
              }
            >
              <Tabs
                defaultActiveKey="single"
                activeKey={activeTab}
                id="create-course-tabs"
                className="nav nav-stretch nav-line-tabs mb-4"
                unmountOnExit
                onSelect={goToTab}
              >
                <Tab eventKey="single" title={translate('Single account')}>
                  <FormGroup label={translate('Email')} required>
                    <Field
                      component={EmailField}
                      name="email"
                      placeholder={translate('e.g. Courseaccount@example.com')}
                      validate={activeTab === 'single' ? required : undefined}
                    />
                  </FormGroup>
                  <TextGroup
                    name="description"
                    placeholder={translate('e.g. Used for automated backups')}
                    spaceless
                    label={translate('Description')}
                  />
                </Tab>
                <Tab eventKey="batch" title={translate('Batch import')}>
                  <WizardStepIndicator
                    steps={stepsBatch}
                    value={stepsBatch[step]}
                    onClick={(_, index) => {
                      if (invalid) return;
                      if (index === 2 && createdAccounts.length === 0) return;
                      setStep(index);
                    }}
                  />
                  {step === 0 ? (
                    <Step1UploadFile />
                  ) : step === 1 ? (
                    <Step2PreviewAndCreate
                      skipErrors={skipErrors}
                      setSkipErrors={setSkipErrors}
                    />
                  ) : (
                    <Step3CreationProgress
                      createdAccounts={createdAccounts}
                      projectUuid={project.uuid}
                    />
                  )}
                </Tab>
              </Tabs>
            </ModalDialog>
          </form>
        );
      }}
    />
  );
};
