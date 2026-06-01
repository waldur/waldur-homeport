import { useRouter } from '@uirouter/react';
import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Field, Form } from 'react-final-form';
import { proposalProtectedCallsDuplicate } from 'waldur-js-client';

import { required } from '@/core/validators';
import { SubmitButton, StringGroup } from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { Call } from '../types';

interface DuplicateCallDialogProps {
  resolve: {
    call: Call;
    refetch?(): void;
  };
}

interface FormValues {
  name: string;
  copy_documents: boolean;
  copy_offerings: boolean;
  copy_rounds: boolean;
  copy_workflow_steps: boolean;
  copy_resource_templates: boolean;
  copy_role_mappings: boolean;
  copy_applicant_visibility_config: boolean;
  copy_coi_configuration: boolean;
  copy_matching_configuration: boolean;
  copy_assignment_configuration: boolean;
}

const defaultSelections = {
  copy_documents: true,
  copy_offerings: true,
  copy_rounds: true,
  copy_workflow_steps: true,
  copy_resource_templates: true,
  copy_role_mappings: true,
  copy_applicant_visibility_config: true,
  copy_coi_configuration: true,
  copy_matching_configuration: true,
  copy_assignment_configuration: true,
};

export const DuplicateCallDialog: FC<DuplicateCallDialogProps> = ({
  resolve,
}) => {
  const router = useRouter();
  const mutation = useManagedMutation<any, any, FormValues>({
    mutationFn: (values) =>
      proposalProtectedCallsDuplicate({
        path: { uuid: resolve.call.uuid },
        body: values,
      }),
    onSuccess: (response) => {
      const newUuid = response.data?.uuid;
      if (newUuid) {
        router.stateService.go('protected-call.main', { call_uuid: newUuid });
      }
    },
    successMessage: translate('Call duplicated successfully.'),
    errorMessage: translate('Unable to duplicate call.'),
    refetch: resolve.refetch,
  });

  return (
    <Form<FormValues>
      onSubmit={(values) => mutation.mutateAsync(values)}
      initialValues={{
        name: `${resolve.call.name} (${translate('copy')})`,
        ...defaultSelections,
      }}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Duplicate call')}
            subtitle={translate(
              'Create a copy of this call. Team, proposals and reviews are never copied.',
            )}
            footer={
              <>
                <div className="min-w-150px">
                  <CloseDialogButton
                    label={translate('Cancel')}
                    className="w-100"
                  />
                </div>
                <div className="min-w-150px">
                  <SubmitButton
                    submitting={submitting || mutation.isPending}
                    label={translate('Confirm')}
                    invalid={invalid}
                    className="w-100"
                  />
                </div>
              </>
            }
          >
            <StringGroup
              name="name"
              validate={required}
              label={translate('New call name')}
              required
              description={translate(
                'Pre-filled from the source call. The copy always starts in Draft state.',
              )}
            />

            <h5 className="mb-4">{translate('Copy options')}</h5>
            <Row>
              <Col md={6}>
                <Field
                  name="copy_documents"
                  component={AwesomeCheckboxField}
                  label={translate('Documents')}
                  help_text={translate(
                    'Reuse the same document library entries.',
                  )}
                  type="checkbox"
                />
                <Field
                  name="copy_offerings"
                  component={AwesomeCheckboxField}
                  label={translate('Offerings')}
                  help_text={translate(
                    'Copy requested offerings (reset to "Requested" state).',
                  )}
                  type="checkbox"
                />
                <Field
                  name="copy_rounds"
                  component={AwesomeCheckboxField}
                  label={translate('Rounds')}
                  help_text={translate(
                    'Copy round schedule and configuration only; no proposals follow.',
                  )}
                  type="checkbox"
                />
                <Field
                  name="copy_workflow_steps"
                  component={AwesomeCheckboxField}
                  label={translate('Workflow steps')}
                  help_text={translate(
                    'Copy the proposal evaluation step definitions.',
                  )}
                  type="checkbox"
                />
                <Field
                  name="copy_resource_templates"
                  component={AwesomeCheckboxField}
                  label={translate('Resource templates')}
                  help_text={translate(
                    'Copy resource-request templates. Skipped automatically if "Offerings" is unchecked.',
                  )}
                  type="checkbox"
                />
              </Col>
              <Col md={6}>
                <Field
                  name="copy_role_mappings"
                  component={AwesomeCheckboxField}
                  label={translate('Role mappings')}
                  help_text={translate(
                    'Copy proposal-to-project role mappings.',
                  )}
                  type="checkbox"
                />
                <Field
                  name="copy_applicant_visibility_config"
                  component={AwesomeCheckboxField}
                  label={translate('Applicant visibility')}
                  help_text={translate(
                    'Copy applicant-data visibility settings.',
                  )}
                  type="checkbox"
                />
                <Field
                  name="copy_coi_configuration"
                  component={AwesomeCheckboxField}
                  label={translate('COI configuration')}
                  help_text={translate(
                    'Copy conflict-of-interest detection settings.',
                  )}
                  type="checkbox"
                />
                <Field
                  name="copy_matching_configuration"
                  component={AwesomeCheckboxField}
                  label={translate('Matching configuration')}
                  help_text={translate(
                    'Copy reviewer-proposal affinity calculation settings.',
                  )}
                  type="checkbox"
                />
                <Field
                  name="copy_assignment_configuration"
                  component={AwesomeCheckboxField}
                  label={translate('Assignment configuration')}
                  help_text={translate(
                    'Copy reviewer assignment automation settings.',
                  )}
                  type="checkbox"
                />
              </Col>
            </Row>
          </ModalDialog>
        </form>
      )}
    />
  );
};
