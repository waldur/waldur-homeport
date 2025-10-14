import { LinkIcon, UsersThreeIcon } from '@phosphor-icons/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Field, reduxForm, formValueSelector } from 'redux-form';
import { userGroupInvitationsCreate } from 'waldur-js-client';
import { Project } from 'waldur-js-client';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { AwesomeRadioButton } from '@waldur/core/AwesomeRadioButton';
import { required } from '@waldur/core/validators';
import { useCustomerProjects } from '@waldur/customer/workspace/fetchCustomer';
import { FormGroup } from '@waldur/form';
import { translate } from '@waldur/i18n';
import {
  GROUP_INVITATION_CREATE_FORM_ID,
  invitationTypeOptions,
} from '@waldur/invitations/actions/constants';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { Role } from '@waldur/permissions/types';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { RootState } from '@waldur/store/reducers';
import { getCustomer } from '@waldur/workspace/selectors';

import { AdvancedSettingsGroup } from './AdvancedSettingsGroup';
import { AutoCreateProjectGroup } from './AutoCreateProjectGroup';
import { InvitationLinkField } from './InvitationLinkField';
import { ProjectGroup } from './ProjectGroup';
import { RoleGroup } from './RoleGroup';
import { GroupInvitationType } from './types';

interface OwnProps {
  resolve: { refetch(): void; roles: Role[] };
}

interface GroupInvitationCreateFormData {
  type: GroupInvitationType;
  role: Role;
  project?: Project;
  project_name_template: string;
  auto_create_project: boolean;
  user_affiliations: string;
  user_email_patterns: string;
}

export const GroupInvitationCreateDialog = reduxForm<
  GroupInvitationCreateFormData,
  OwnProps
>({
  form: GROUP_INVITATION_CREATE_FORM_ID,
})(({ resolve: { refetch, roles }, submitting, handleSubmit, change }) => {
  const dispatch = useDispatch();
  const customer = useSelector(getCustomer);
  const formValues = useSelector((state: RootState) =>
    formValueSelector(GROUP_INVITATION_CREATE_FORM_ID)(
      state,
      'type',
      'role',
      'auto_create_project',
    ),
  ) as GroupInvitationCreateFormData;
  const { loading } = useCustomerProjects();

  const [invitation, setInvitation] = useState(null);

  const filteredRoles = useMemo(
    () =>
      formValues.type === 'public'
        ? roles.filter((role) => role.content_type === 'project')
        : roles,
    [formValues.type, roles],
  );

  useEffect(() => {
    if (formValues.type === 'public') {
      change('auto_create_project', true);
      if (formValues.role?.content_type !== 'project') {
        change('role', null);
      }
    }
  }, [formValues.type, change]);

  useEffect(() => {
    if (formValues.auto_create_project) {
      change('project', null);
    }
  }, [formValues.auto_create_project, change]);

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
            ...(formData.role.content_type === 'project'
              ? {
                  project_role: formData.role.uuid,
                  project_name_template: formData.project_name_template,
                  auto_create_project: formData.auto_create_project,
                  user_affiliations: formData.user_affiliations,
                  user_email_patterns: formData.user_email_patterns
                    ? formData.user_email_patterns.split(' ')
                    : formData.user_email_patterns,
                }
              : {}),
          },
        });
        setInvitation(res.data);
        dispatch(showSuccess('Group invitation has been created.'));
        if (refetch) refetch();
      } catch (e) {
        dispatch(showErrorResponse(e, 'Unable to create group invitation.'));
      }
    },
    [dispatch, customer, refetch, setInvitation],
  );

  const fieldsDisabled = submitting || Boolean(invitation);

  return (
    <form onSubmit={handleSubmit(createInvitation)}>
      <ModalDialog
        title={translate('Create group invitation')}
        iconNode={<UsersThreeIcon weight="bold" />}
        iconColor="success"
        closeButton
      >
        <div className="pb-5 mb-5 border-bottom">
          <Field
            name="type"
            component={FormGroup}
            label={translate('Invitation type')}
            direction="horizontal"
            validate={[required]}
            space={2}
            disabled={fieldsDisabled}
          >
            <AwesomeRadioButton choices={invitationTypeOptions} />
          </Field>
          <RoleGroup roles={filteredRoles} disabled={fieldsDisabled} />
          <ProjectGroup
            customer={customer}
            loading={loading}
            disabled={fieldsDisabled || formValues.auto_create_project}
            required={!formValues.auto_create_project}
          />
          <AutoCreateProjectGroup disabled={fieldsDisabled} />
          <AdvancedSettingsGroup disabled={fieldsDisabled} />
          <SubmitButton
            variant="secondary"
            submitting={submitting}
            invalid={Boolean(invitation)}
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
});
