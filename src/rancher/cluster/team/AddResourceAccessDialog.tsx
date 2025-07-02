import { PlusCircleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { formValueSelector, reduxForm } from 'redux-form';
import {
  keycloakUserGroupMembershipsCreate,
  projectsListUsersList,
  rancherProjectsList,
  rancherRoleTemplatesList,
  Resource,
  UserRoleDetails,
} from 'waldur-js-client';

import { getAllPages } from '@waldur/core/api';
import { ENV } from '@waldur/core/config';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { required } from '@waldur/core/validators';
import {
  FormContainer,
  SelectField,
  StringField,
  SubmitButton,
} from '@waldur/form';
import { EmailField } from '@waldur/form/EmailField';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { UserListOptionInline } from '@waldur/project/team/UserListOptionInline';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { RootState } from '@waldur/store/reducers';

const FORM_ID = 'AddResourceAccessDialog';

interface ResourceAccessFormData {
  username: string;
  email: string;
  scope: string;
  scope_uuid: string;
  role: string;
}

interface AddResourceAccessDialogProps {
  resource: Resource;
  refetch;
}

const getOptionLabel = (option: UserRoleDetails) =>
  option.user_email
    ? (option.user_full_name || option.user_username) +
      ` (${option.user_email})`
    : option.user_full_name || option.user_username;

export const AddResourceAccessDialog = reduxForm<
  ResourceAccessFormData,
  AddResourceAccessDialogProps
>({
  form: FORM_ID,
})(({ resource, submitting, handleSubmit, refetch, invalid, change }) => {
  const dispatch = useDispatch();

  const [userType, setUserType] = useState<'external-user' | 'project-member'>(
    'external-user',
  );
  const [scope, setScope] = useState<'cluster' | 'project'>(null);

  const changeUserType = (value) => {
    setUserType((prev) => {
      if (prev !== value) {
        change('username', '');
        change('email', '');
      }
      return value;
    });
  };

  // Fetch resource project users
  const {
    data: projectUsers,
    isLoading: isLoadingUsers,
    error: errorUsers,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ['ProjectTeam', resource.project_uuid, userType],

    queryFn: () =>
      userType === 'project-member' &&
      getAllPages((page) =>
        projectsListUsersList({
          path: { uuid: resource.project_uuid },
          query: {
            page,
            field: [
              'user_uuid',
              'user_full_name',
              'user_email',
              'role_name',
              'user_username',
              'user_image',
            ],
          },
        }),
      ).then((users) =>
        users.map((user) => ({
          ...user,
          full_name: user.user_full_name,
          email: user.user_email,
          username: user.user_username,
          image: user.user_image,
        })),
      ),

    staleTime: 3 * 60 * 1000,
  });

  // Fetch rancher projects
  const {
    data: projects,
    isLoading: isLoadingProjects,
    error: errorProjects,
    refetch: refetchProjects,
  } = useQuery({
    queryKey: ['RancherProjects', scope, resource.uuid],

    queryFn: () =>
      scope === 'project' &&
      getAllPages((page) =>
        rancherProjectsList({ query: { page, cluster_uuid: resource.uuid } }),
      ),

    staleTime: 3 * 60 * 1000,
  });

  // Fetch cluster/project roles
  const {
    data: roles,
    isLoading: isLoadingRoles,
    error: errorRoles,
    refetch: refetchRoles,
  } = useQuery({
    queryKey: ['ScopeTemplates', scope, resource.service_settings_uuid],

    queryFn: () =>
      scope &&
      getAllPages((page) =>
        rancherRoleTemplatesList({
          query: {
            page,
            scope_type: scope,
            settings_uuid: resource.service_settings_uuid,
          },
        }),
      ),

    staleTime: 3 * 60 * 1000,
  });

  const username = useSelector((state: RootState) =>
    formValueSelector(FORM_ID)(state, 'username'),
  );

  useEffect(() => {
    if (userType === 'project-member' && username && projectUsers) {
      const user = projectUsers.find((u) => u.user_username === username);
      change('email', user.user_email);
    }
  }, [username, userType, projectUsers, change]);

  const save = async (formData: ResourceAccessFormData) => {
    try {
      await keycloakUserGroupMembershipsCreate({
        body: {
          username: formData.username,
          email: formData.email,
          role: formData.role,
          scope_uuid:
            scope === 'cluster' ? resource.resource_uuid : formData.scope_uuid,
        },
      });
      await refetch();
      dispatch(showSuccess('Resource access has been added.'));
      dispatch(closeModalDialog());
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to add resource access.')),
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(save)}>
      <ModalDialog
        title={translate('Resource access')}
        subtitle={translate(
          'Configure access permissions for a user in the rancher cluster',
        )}
        footer={
          <>
            <CloseDialogButton className="w-175px" />
            <SubmitButton
              label={translate('Confirm')}
              submitting={submitting}
              disabled={invalid}
              className="btn btn-primary w-175px"
            />
          </>
        }
        iconNode={<PlusCircleIcon weight="bold" />}
        iconColor="success"
      >
        <FormContainer submitting={submitting} className="size-lg" asRow>
          <ToggleButtonGroup
            name="userType"
            value={userType}
            onChange={changeUserType}
            type="radio"
          >
            <ToggleButton
              value="external-user"
              id="user-type-external-user"
              variant="outline-default"
              className="btn-outline btn-active-primary"
            >
              {translate('External user')}
            </ToggleButton>
            <ToggleButton
              value="project-member"
              id="user-type-project-member"
              variant="outline-default"
              className="btn-outline btn-active-primary"
            >
              {translate('Project member')}
            </ToggleButton>
          </ToggleButtonGroup>

          {userType === 'project-member' && errorUsers && (
            <LoadingErred
              loadData={refetchUsers}
              message={translate('Unable to load project users')}
            />
          )}

          {userType === 'project-member' ? (
            <SelectField
              name="username"
              label={
                ENV.plugins.WALDUR_CORE.RANCHER_USERNAME_INPUT_LABEL ||
                translate('Username')
              }
              placeholder={translate('e.g.') + ', EE12345667890'}
              isLoading={isLoadingUsers}
              options={projectUsers}
              getOptionValue={(opt) => opt.user_username}
              getOptionLabel={getOptionLabel}
              simpleValue
              components={{ Option: UserListOptionInline }}
              containerClassName="col-md-6"
              validate={required}
            />
          ) : (
            <StringField
              name="username"
              label={
                ENV.plugins.WALDUR_CORE.RANCHER_USERNAME_INPUT_LABEL ||
                translate('Username')
              }
              placeholder={translate('e.g.') + ', EE12345667890'}
              containerClassName="col-md-6"
              validate={required}
            />
          )}
          <EmailField
            name="email"
            label={translate('Email')}
            placeholder="olivia@waldur.com"
            containerClassName="col-md-6"
            disabled={userType === 'project-member'}
            validate={required}
          />

          <h6>{translate('Permissions')}</h6>
          <SelectField
            label={translate('Scope')}
            name="scope"
            value={scope}
            onChange={setScope}
            options={[
              { label: translate('Cluster'), value: 'cluster' },
              { label: translate('Project'), value: 'project' },
            ]}
            simpleValue
            validate={required}
          />

          {scope === 'project' && errorProjects && (
            <LoadingErred
              loadData={refetchProjects}
              message={translate('Unable to load projects')}
            />
          )}
          {scope === 'project' && (
            <SelectField
              label={translate('Project')}
              name="scope_uuid"
              isLoading={isLoadingProjects}
              getOptionValue={(opt) => opt.uuid}
              getOptionLabel={(opt) => opt.name}
              options={projects}
              simpleValue
              containerClassName="col-md-6"
              validate={required}
            />
          )}

          {scope && errorRoles && (
            <LoadingErred
              loadData={refetchRoles}
              message={translate('Unable to load roles')}
            />
          )}
          {!!scope && (
            <SelectField
              label={translate('Role')}
              name="role"
              isLoading={isLoadingRoles}
              getOptionValue={(opt) => opt.url}
              getOptionLabel={(opt) => `${opt.display_name} (${opt.name})`}
              options={roles}
              simpleValue
              containerClassName={scope === 'project' ? 'col-md-6' : undefined}
              validate={required}
            />
          )}
        </FormContainer>
      </ModalDialog>
    </form>
  );
});
