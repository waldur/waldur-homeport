import { PencilSimpleIcon } from '@phosphor-icons/react';
import { useCallback, useEffect, useMemo } from 'react';
import { Form, Field } from 'react-final-form';
import { useSelector } from 'react-redux';
import {
  GroupInvitation,
  userGroupInvitationsPartialUpdate,
} from 'waldur-js-client';

import { AwesomeRadioButton } from '@/core/AwesomeRadioButton';
import { ENV } from '@/core/config';
import { required, validateMaxLength } from '@/core/validators';
import { useCustomerProjects } from '@/customer/workspace/fetchCustomer';
import { SubmitButton, TextField } from '@/form';
import { translate } from '@/i18n';
import { invitationTypeOptions } from '@/invitations/actions/constants';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { Role } from '@/permissions/types';
import { useNotify } from '@/store/hooks';
import { getCustomer, isStaff } from '@/workspace/selectors';

import { AdvancedSettingsGroup } from './AdvancedSettingsGroup';
import { AutoCreateProjectGroup } from './AutoCreateProjectGroup';
import { ProjectGroup } from './ProjectGroup';
import { RestrictionsInfoCard } from './RestrictionsInfoCard';
import { RoleGroup } from './RoleGroup';
import { GroupInvitationType } from './types';

interface OwnProps {
  resolve: {
    refetch(): void;
    roles: Role[];
    invitation: GroupInvitation;
  };
}

export const GroupInvitationEditDialog = ({
  resolve: { refetch, roles, invitation },
}: OwnProps) => {
  const { showSuccess, showErrorResponse } = useNotify();
  const customer = useSelector(getCustomer);
  const isStaffUser = useSelector(isStaff);
  const { loading } = useCustomerProjects();

  const typeOptions = useMemo(
    () =>
      isStaffUser
        ? invitationTypeOptions
        : invitationTypeOptions.filter((option) => option.value !== 'public'),
    [isStaffUser],
  );

  // Find the matching Role object from ENV.roles for the invitation's role UUID
  const initialRole = useMemo(
    () => ENV.roles.find((r) => r.uuid === invitation.role),
    [invitation.role],
  );

  const initialProject = useMemo(() => {
    if (
      initialRole?.content_type === 'project' &&
      !invitation.auto_create_project
    ) {
      return customer?.projects?.find((p) => p.uuid === invitation.scope_uuid);
    }
    return undefined;
  }, [initialRole, invitation, customer]);

  const initialValues = useMemo(
    () => ({
      type: (invitation.is_public
        ? 'public'
        : 'private') as GroupInvitationType,
      role: initialRole,
      project: initialProject,
      auto_create_project: invitation.auto_create_project ?? false,
      auto_approve: invitation.auto_approve ?? false,
      allow_custom_project_details:
        invitation.allow_custom_project_details ?? false,
      allow_multiple_requests: invitation.allow_multiple_requests ?? false,
      project_name_template: invitation.project_name_template ?? '',
      user_affiliations: invitation.user_affiliations ?? [],
      user_email_patterns: invitation.user_email_patterns ?? [],
      custom_text: invitation.custom_text ?? '',
    }),
    [invitation, initialRole, initialProject],
  );

  const updateInvitation = useCallback(
    async (formData) => {
      try {
        let scope = customer.url;
        if (
          formData.role.content_type === 'project' &&
          !formData.auto_create_project
        ) {
          scope = formData.project?.url ?? customer.url;
        }
        await userGroupInvitationsPartialUpdate({
          path: { uuid: invitation.uuid },
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
              : {
                  auto_create_project: false,
                  auto_approve: false,
                  allow_custom_project_details: false,
                  allow_multiple_requests: false,
                }),
          },
        });
        showSuccess(translate('Group invitation has been updated.'));
        if (refetch) refetch();
      } catch (e) {
        showErrorResponse(e, translate('Unable to update group invitation.'));
      }
    },
    [customer, invitation.uuid, refetch, showSuccess, showErrorResponse],
  );

  return (
    <Form
      onSubmit={updateInvitation}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, values, form, invalid }) => {
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
              title={translate('Edit group invitation')}
              iconNode={<PencilSimpleIcon weight="bold" />}
              iconColor="info"
              closeButton
              footer={
                <>
                  <CloseDialogButton />
                  <SubmitButton
                    submitting={submitting}
                    invalid={invalid}
                    label={translate('Save changes')}
                  />
                </>
              }
            >
              <FormGroup label={translate('Invitation type')} required>
                <Field
                  name="type"
                  validate={required}
                  render={({ input }) => (
                    <AwesomeRadioButton
                      choices={typeOptions}
                      disabled={submitting}
                      input={input as any}
                    />
                  )}
                />
              </FormGroup>
              <RoleGroup roles={filteredRoles} disabled={submitting} />
              <ProjectGroup
                key={String(values.auto_create_project)}
                customer={customer}
                loading={loading}
                disabled={submitting || values?.auto_create_project}
                required={!values?.auto_create_project}
              />
              <AutoCreateProjectGroup disabled={submitting} />
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
                      disabled={submitting}
                    />
                  </FormGroup>
                )}
              />
              <AdvancedSettingsGroup disabled={submitting} />
            </ModalDialog>
          </form>
        );
      }}
    />
  );
};
