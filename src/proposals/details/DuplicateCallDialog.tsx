import { useRouter } from '@uirouter/react';
import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Form } from 'react-final-form';
import { proposalProtectedCallsDuplicate } from 'waldur-js-client';

import { required } from '@/core/validators';
import { SubmitButton, StringGroup, BooleanGroup } from '@/form';
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
                <BooleanGroup
                  name="copy_documents"
                  label={translate('Documents')}
                  description={translate(
                    'Reuse the same document library entries.',
                  )}
                />
                <BooleanGroup
                  name="copy_offerings"
                  label={translate('Offerings')}
                  description={translate(
                    'Copy requested offerings (reset to "Requested" state).',
                  )}
                />
                <BooleanGroup
                  name="copy_rounds"
                  label={translate('Rounds')}
                  description={translate(
                    'Copy round schedule and configuration only; no proposals follow.',
                  )}
                />
                <BooleanGroup
                  name="copy_workflow_steps"
                  label={translate('Workflow steps')}
                  description={translate(
                    'Copy the proposal evaluation step definitions.',
                  )}
                />
                <BooleanGroup
                  name="copy_resource_templates"
                  label={translate('Resource templates')}
                  description={translate(
                    'Copy resource-request templates. Skipped automatically if "Offerings" is unchecked.',
                  )}
                />
              </Col>
              <Col md={6}>
                <BooleanGroup
                  name="copy_role_mappings"
                  label={translate('Role mappings')}
                  description={translate(
                    'Copy proposal-to-project role mappings.',
                  )}
                />
                <BooleanGroup
                  name="copy_applicant_visibility_config"
                  label={translate('Applicant visibility')}
                  description={translate(
                    'Copy applicant-data visibility settings.',
                  )}
                />
                <BooleanGroup
                  name="copy_coi_configuration"
                  label={translate('COI configuration')}
                  description={translate(
                    'Copy conflict-of-interest detection settings.',
                  )}
                />
                <BooleanGroup
                  name="copy_matching_configuration"
                  label={translate('Matching configuration')}
                  description={translate(
                    'Copy reviewer-proposal affinity calculation settings.',
                  )}
                />
                <BooleanGroup
                  name="copy_assignment_configuration"
                  label={translate('Assignment configuration')}
                  description={translate(
                    'Copy reviewer assignment automation settings.',
                  )}
                />
              </Col>
            </Row>
          </ModalDialog>
        </form>
      )}
    />
  );
};
