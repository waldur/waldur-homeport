import { LinkIcon, UsersThreeIcon } from '@phosphor-icons/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Form, Field } from 'react-final-form';
import { useSelector } from 'react-redux';
import { userGroupInvitationsCreate } from 'waldur-js-client';
import { Project } from 'waldur-js-client';

import { AwesomeRadioButton } from '@/core/AwesomeRadioButton';
import { required, validateMaxLength } from '@/core/validators';
import { useCustomerProjects } from '@/customer/workspace/fetchCustomer';
import { SubmitButton, TextField } from '@/form';
import { translate } from '@/i18n';
import { invitationTypeOptions } from '@/invitations/actions/constants';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { ModalDialog } from '@/modal/ModalDialog';
import { Role } from '@/permissions/types';
import { useNotify } from '@/store/notify';
import { useCustomer } from '@/workspace/hooks';
import { isStaff } from '@/workspace/selectors';

import { AdvancedSettingsGroup } from './AdvancedSettingsGroup';
import { AutoCreateProjectGroup } from './AutoCreateProjectGroup';
import { InvitationLinkField } from './InvitationLinkField';
import { ProjectGroup } from './ProjectGroup';
import { RestrictionsInfoCard } from './RestrictionsInfoCard';
import { RoleGroup } from './RoleGroup';
import { GroupInvitationType } from './types';

interface OwnProps {
  resolve: { refetch(): void; roles: Role[] };
}

const initialValues = { type: 'private' };

interface GroupInvitationCreateFormData {
  type: GroupInvitationType;
  role: Role;
  project?: Project;
  project_name_template: string;
  auto_create_project: boolean;
  auto_approve: boolean;
  allow_custom_project_details: boolean;
  allow_multiple_requests: boolean;
  user_affiliations: Array<string>;
  user_email_patterns: Array<string>;
  custom_text: string;
}

export const GroupInvitationCreateDialog = ({
  resolve: { refetch, roles },
}: OwnProps) => {
  const { showSuccess, showErrorResponse } = useNotify();
  const customer = useCustomer();
  const isStaffUser = useSelector(isStaff);
  const { loading } = useCustomerProjects();

  const typeOptions = useMemo(
    () =>
      isStaffUser
        ? invitationTypeOptions
        : invitationTypeOptions.filter((option) => option.value !== 'public'),
    [isStaffUser],
  );

  const [invitation, setInvitation] = useState(null);

  const createInvitation = useCallback(
    async (formData: GroupInvitationCreateFormData) => {
      try {
        let scope = customer.url;
        if (
          formData.role.content_type === 'project' &&
          !formData.auto_create_project
        ) {
          scope = formData.project.url;
        }
        const res = await userGroupInvitationsCreate({
          body: {
            is_public: formData.type === 'public',
            role: formData.role.uuid,
            scope,
            custom_text: formData.custom_text || '',
            ...(formData.role.content_type === 'project'
              ? {
                  project_role: formData.role.uuid,
                  project_name_template: formData.project_name_template,
                  auto_create_project: formData.auto_create_project,
                  auto_approve: formData.auto_approve,
                  allow_custom_project_details:
                    formData.allow_custom_project_details,
                  allow_multiple_requests: formData.allow_multiple_requests,
                  user_affiliations: formData.user_affiliations,
                  user_email_patterns: formData.user_email_patterns,
                }
              : {}),
          },
        });
        setInvitation(res.data);
        showSuccess(translate('Group invitation has been created.'));
        if (refetch) refetch();
      } catch (e) {
        showErrorResponse(e, translate('Unable to create group invitation.'));
      }
    },
    [customer, refetch, setInvitation, showSuccess, showErrorResponse],
  );

  return (
    <Form
      onSubmit={createInvitation}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, values, form, invalid }) => {
        const fieldsDisabled = submitting || Boolean(invitation);

        const filteredRoles = useMemo(
          () =>
            values?.type === 'public'
              ? roles.filter((role) => role.content_type === 'project')
              : roles,
          [values?.type, roles],
        );

        useEffect(() => {
          if (values.type === 'public') {
            form.change('auto_create_project', true);
            if (values.role?.content_type !== 'project') {
              form.change('role', null);
            }
          }
        }, [values.type, form.change]);

        useEffect(() => {
          if (values.auto_create_project) {
            form.change('project', null);
          }
        }, [values.auto_create_project, form.change]);

        return (
          <form onSubmit={handleSubmit}>
            <ModalDialog
              title={translate('Create group invitation')}
              iconNode={<UsersThreeIcon weight="bold" />}
              iconColor="success"
            >
              <div className="pb-5 mb-5 border-bottom">
                <FormGroup label={translate('Invitation type')} required>
                  <Field
                    name="type"
                    validate={required}
                    render={({ input }) => (
                      <AwesomeRadioButton
                        choices={typeOptions}
                        disabled={fieldsDisabled}
                        input={input as any}
                      />
                    )}
                  />
                </FormGroup>
                <RoleGroup roles={filteredRoles} disabled={fieldsDisabled} />
                <ProjectGroup
                  key={String(values.auto_create_project)}
                  customer={customer}
                  loading={loading}
                  disabled={fieldsDisabled || values?.auto_create_project}
                  required={!values?.auto_create_project}
                />
                <AutoCreateProjectGroup disabled={fieldsDisabled} />
                <RestrictionsInfoCard
                  customer={customer}
                  project={values?.project}
                />
                <Field
                  name="custom_text"
                  validate={validateMaxLength(500)}
                  render={({ input, meta }) => (
                    <FormGroup
                      label={translate('Custom text')}
                      description={translate(
                        'Optional message displayed to users viewing this invitation.',
                      )}
                      meta={meta}
                    >
                      <TextField
                        input={input as any}
                        isInvalid={Boolean(meta.error)}
                        disabled={fieldsDisabled}
                      />
                    </FormGroup>
                  )}
                />
                <AdvancedSettingsGroup disabled={fieldsDisabled} />
                <SubmitButton
                  variant="secondary"
                  submitting={submitting}
                  invalid={Boolean(invitation) || invalid}
                >
                  <span className="svg-icon svg-icon-2">
                    <LinkIcon weight="bold" />
                  </span>
                  {translate('Generate link')}
                </SubmitButton>
              </div>
              <InvitationLinkField invitation={invitation} />
            </ModalDialog>
          </form>
        );
      }}
    />
  );
};
