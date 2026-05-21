import { FunctionComponent, useCallback } from 'react';
import { Form } from 'react-final-form';
import {
  marketplaceResourceProjectsRecover,
  ResourceProject,
} from 'waldur-js-client';

import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { FormContainer } from '@/form/FormContainer';
import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

interface PreviousMember {
  user_username: string;
  user_first_name?: string;
  user_last_name?: string;
  user_email?: string;
  role_name: string;
}

interface TerminationMetadata {
  terminated_at?: string;
  terminated_by?: string | null;
  user_roles?: PreviousMember[];
}

interface FormData {
  restore_team_members?: boolean;
  send_invitations_to_previous_members?: boolean;
}

interface RestoreProjectDialogProps {
  resolve: {
    resource_project: ResourceProject;
    refetch?(): void;
  };
}

const formatMemberName = (m: PreviousMember): string => {
  const full = [m.user_first_name, m.user_last_name].filter(Boolean).join(' ');
  return full || m.user_username;
};

export const RestoreProjectDialog: FunctionComponent<
  RestoreProjectDialogProps
> = ({ resolve: { resource_project, refetch } }) => {
  const metadata = (resource_project.termination_metadata ??
    {}) as TerminationMetadata;
  const previousMembers = metadata.user_roles ?? [];

  const fetchData = useCallback(
    () =>
      Promise.resolve({
        rows: previousMembers,
        resultCount: previousMembers.length,
      }),
    [previousMembers],
  );
  const tableProps = useTable({
    table: `restore-rp-${resource_project.uuid}-members`,
    fetchData,
  });

  const mutation = useManagedMutation<any, any, FormData>({
    mutationFn: (formData) =>
      marketplaceResourceProjectsRecover({
        path: { uuid: resource_project.uuid },
        body: {
          restore_team_members: !!formData.restore_team_members,
          send_invitations_to_previous_members:
            !!formData.send_invitations_to_previous_members,
        },
      }),
    successMessage: translate('Project recovered.'),
    errorMessage: translate('Unable to recover project.'),
    refetch,
  });

  return (
    <Form<FormData>
      onSubmit={(values) => mutation.mutateAsync(values).catch(() => {})}
      initialValues={{
        restore_team_members: false,
        send_invitations_to_previous_members: false,
      }}
      render={({ handleSubmit, submitting, values, form }) => {
        // Mutually exclusive: enabling one disables the other.
        const onRestoreChange = () => {
          if (!values.restore_team_members) {
            form.change('send_invitations_to_previous_members', false);
          }
        };
        const onInviteChange = () => {
          if (!values.send_invitations_to_previous_members) {
            form.change('restore_team_members', false);
          }
        };
        return (
          <form onSubmit={handleSubmit}>
            <ModalDialog
              title={translate('Recover resource project')}
              subtitle={
                <>
                  <b>{translate('Resource project')}</b>:{' '}
                  {resource_project.name}
                </>
              }
              footer={
                <>
                  <CloseDialogButton className="min-w-125px" />
                  <SubmitButton
                    submitting={submitting}
                    label={translate('Recover')}
                    className="btn btn-primary min-w-125px"
                  />
                </>
              }
            >
              <p>
                {translate(
                  'The project will become visible again. By default, members revoked at deletion stay revoked. Optionally restore them or send invitations.',
                )}
              </p>
              <Table<PreviousMember>
                {...tableProps}
                title={translate('Previous members')}
                verboseName={translate('previous members')}
                columns={[
                  {
                    title: translate('Name'),
                    render: ({ row }) => <>{formatMemberName(row)}</>,
                  },
                  {
                    title: translate('Email'),
                    render: ({ row }) => (
                      <>{renderFieldOrDash(row.user_email)}</>
                    ),
                  },
                  {
                    title: translate('Role'),
                    render: ({ row }) => <>{row.role_name}</>,
                  },
                ]}
              />
              <FormContainer submitting={submitting}>
                <AwesomeCheckboxField
                  name="restore_team_members"
                  label={translate(
                    'Restore previous members (recreate their roles)',
                  )}
                  onChange={onRestoreChange}
                  disabled={previousMembers.length === 0}
                />
                <AwesomeCheckboxField
                  name="send_invitations_to_previous_members"
                  label={translate(
                    'Send invitations to previous members instead',
                  )}
                  onChange={onInviteChange}
                  disabled={previousMembers.length === 0}
                />
              </FormContainer>
            </ModalDialog>
          </form>
        );
      }}
    />
  );
};
