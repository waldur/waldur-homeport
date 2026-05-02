import {
  ArrowCounterClockwiseIcon,
  CheckIcon,
  WarningIcon,
} from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { Alert } from 'react-bootstrap';
import { Field, Form } from 'react-final-form';
import {
  Project,
  projectsRecover,
  ProjectRecoveryRequest,
} from 'waldur-js-client';

import { AwesomeRadioButton } from '@/core/AwesomeRadioButton';
import { SubmitButton } from '@/form';
import { DateField } from '@/form/DateField';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/notify';
import { RoleField } from '@/user/affiliations/RoleField';
import { useUser } from '@/workspace/hooks';

interface ProjectRecoveryModalProps {
  resolve: { project: Project };
}

export const ProjectRecoveryModal: FC<ProjectRecoveryModalProps> = ({
  resolve: { project },
}) => {
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();
  const user = useUser();

  const handleRecover = async (values: any) => {
    try {
      const body: ProjectRecoveryRequest = {};

      if (values.roleRecoveryOption === 'restore_team_members') {
        body.restore_team_members = true;
      } else if (
        values.roleRecoveryOption === 'send_invitations_to_previous_members'
      ) {
        body.send_invitations_to_previous_members = true;
      }

      if (values.end_date) {
        body.end_date = values.end_date;
      }

      const response = await projectsRecover({
        path: { uuid: project.uuid },
        body,
      });

      showSuccess(translate('Project has been successfully recovered.'));

      // Show recovery info if available
      const recoveredProject = response.data as any;
      if (recoveredProject.recovery_info) {
        const info = recoveredProject.recovery_info;
        if (info.restored_users_count) {
          showSuccess(
            translate('Restored {count} team members.', {
              count: info.restored_users_count,
            }),
          );
        }
        if (info.sent_invitations_count) {
          showSuccess(
            translate('Sent {count} invitations to previous team members.', {
              count: info.sent_invitations_count,
            }),
          );
        }
      }

      closeDialog();
      window.location.reload();
    } catch (error) {
      showErrorResponse(error, translate('Unable to recover project.'));
    }
  };

  const hasTerminationMetadata = !!project.termination_metadata;
  const previousMembers =
    (project.termination_metadata as any)?.user_roles || [];
  const hasPreviousMembers = previousMembers.length > 0;

  const roleRecoveryChoices = useMemo(
    () => [
      {
        value: '',
        label: translate('Do not restore team members'),
        description: translate(
          'Project will be recovered without restoring any team members',
        ),
      },
      {
        value: 'send_invitations_to_previous_members',
        label: translate('Re-invite team members ({count} users)', {
          count: previousMembers.length,
        }),
        description: translate('Send invitations to users with prior access'),
      },
      ...(user.is_staff
        ? [
            {
              value: 'restore_team_members',
              label: translate('Restore team members ({count} users)', {
                count: previousMembers.length,
              }),
              description: translate(
                'Automatically restore team members who had access before project deletion (staff only)',
              ),
            },
          ]
        : []),
    ],
    [user, previousMembers],
  );

  return (
    <Form
      onSubmit={handleRecover}
      render={({ handleSubmit, submitting, values }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Recover Project')}
            iconNode={<ArrowCounterClockwiseIcon weight="bold" />}
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  submitting={submitting}
                  label={translate('Recover Project')}
                  className="btn btn-primary"
                />
              </>
            }
          >
            <div className="mb-4">
              <h5>{translate('Project Recovery')}</h5>
              <p className="text-muted mb-3">
                {translate(
                  'You are about to recover the removed project "{projectName}". This action will:',
                  { projectName: project.name },
                )}
              </p>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <CheckIcon className="text-success me-2" weight="bold" />
                  {translate('Restore project access and functionality')}
                </li>
                <li className="mb-2">
                  <CheckIcon className="text-success me-2" weight="bold" />
                  {translate('Re-enable project management capabilities')}
                </li>
                <li className="mb-2">
                  <WarningIcon className="text-warning me-2" weight="bold" />
                  {translate('Resources will need to be manually recreated')}
                </li>
                {!hasTerminationMetadata && (
                  <li className="mb-2">
                    <WarningIcon className="text-warning me-2" weight="bold" />
                    {translate(
                      'User roles will need to be manually reassigned',
                    )}
                  </li>
                )}
              </ul>
            </div>

            {hasPreviousMembers && (
              <div className="mb-4">
                <Field
                  name="roleRecoveryOption"
                  defaultValue=""
                  render={({ input }) => (
                    <AwesomeRadioButton
                      label={translate(
                        'Choose what should be restored along with the project:',
                      )}
                      choices={roleRecoveryChoices}
                      input={input as any}
                    />
                  )}
                />

                {(values.roleRecoveryOption ===
                  'send_invitations_to_previous_members' ||
                  values.roleRecoveryOption === 'restore_team_members') && (
                  <div
                    className="border rounded p-3 mb-3 mt-3"
                    style={{ maxHeight: '200px', overflowY: 'auto' }}
                  >
                    <h6 className="mb-2">
                      {translate('Previous team members:')}
                    </h6>
                    <div className="table-responsive">
                      <table className="table table-sm mb-0">
                        <thead>
                          <tr>
                            <th>{translate('Name')}</th>
                            <th>{translate('Email')}</th>
                            <th>{translate('Role')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previousMembers.map((member, index) => (
                            <tr key={index}>
                              <td>
                                {member.user_first_name || member.user_last_name
                                  ? `${member.user_first_name} ${member.user_last_name}`.trim()
                                  : member.user_username}
                              </td>
                              <td>{member.user_email}</td>
                              <td>
                                <RoleField row={member} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mb-4">
              <FormGroup
                label={translate('End date (optional)')}
                description={translate(
                  'Set an expiration date for the recovered project',
                )}
              >
                <Field
                  name="end_date"
                  component={DateField as any}
                  placeholder="YYYY-MM-DD"
                />
              </FormGroup>
            </div>

            {!hasTerminationMetadata && (
              <Alert variant="info">
                <h6 className="alert-heading">
                  {translate('Basic Recovery Available')}
                </h6>
                <p className="mb-0">
                  {translate(
                    'This project was deleted before team member metadata was captured. Only basic project recovery is available. Team members will need to be manually added after recovery.',
                  )}
                </p>
              </Alert>
            )}
          </ModalDialog>
        </form>
      )}
    />
  );
};
