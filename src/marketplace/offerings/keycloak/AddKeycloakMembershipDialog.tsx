import { PlusCircleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useCallback, useMemo, useState } from 'react';
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { Field, Form } from 'react-final-form';
import {
  marketplaceOfferingUserRolesList,
  offeringKeycloakMembershipsCreate,
  OfferingUserRole,
  projectsListUsersList,
  PublicOfferingDetails,
  Resource,
  UserRoleDetails,
} from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@waldur/core/api';
import { UI_STALE_TIME } from '@waldur/core/constants';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { required } from '@waldur/core/validators';
import { SelectField, StringField, SubmitButton } from '@waldur/form';
import { EmailField } from '@waldur/form/EmailField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { UserListOptionInline } from '@waldur/project/team/UserListOptionInline';
import { useNotify } from '@waldur/store/hooks';

import { ScopeOption } from './AddScopeOptionDialog';

const getOptionLabel = (option: UserRoleDetails) =>
  option.user_email
    ? (option.user_full_name || option.user_username) +
      ` (${option.user_email})`
    : option.user_full_name || option.user_username;

interface AddKeycloakMembershipDialogProps {
  resolve: {
    resource: Resource;
    offering: PublicOfferingDetails;
    refetch(): void;
  };
}

export const AddKeycloakMembershipDialog: FC<
  AddKeycloakMembershipDialogProps
> = ({ resolve }) => {
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();

  const [userType, setUserType] = useState<'external-user' | 'project-member'>(
    'project-member',
  );

  const usernameLabel =
    (resolve.offering.plugin_options as any)?.keycloak_username_label ||
    translate('Username');

  // Fetch offering roles
  const {
    data: roles,
    isLoading: isLoadingRoles,
    error: errorRoles,
    refetch: refetchRoles,
  } = useQuery({
    queryKey: ['OfferingRoles', resolve.offering.uuid],
    queryFn: () =>
      getAllPages((page) =>
        marketplaceOfferingUserRolesList({
          query: {
            page,
            page_size: MAX_PAGE_SIZE,
            offering_uuid: [resolve.offering.uuid],
          },
        }),
      ),
    staleTime: UI_STALE_TIME,
  });

  // Available scopes configured by the service provider (per resource)
  const availableScopes: ScopeOption[] = useMemo(
    () => (resolve.resource.options as any)?.keycloak_available_scopes || [],
    [resolve.resource],
  );

  // Distinct scope types that have both configured scopes AND matching roles
  const configurableScopeTypes = useMemo(() => {
    const scopeTypesWithScopes = new Set(
      availableScopes.map((s) => s.scope_type),
    );
    if (!roles) return [];
    const seen = new Set<string>();
    return roles
      .filter(
        (r) =>
          r.scope_type &&
          scopeTypesWithScopes.has(r.scope_type) &&
          !seen.has(r.scope_type) &&
          (seen.add(r.scope_type), true),
      )
      .map((r) => ({
        value: r.scope_type,
        label:
          r.scope_type_label ||
          r.scope_type.charAt(0).toUpperCase() + r.scope_type.slice(1),
      }));
  }, [availableScopes, roles]);

  // Fetch project users when "project-member" is selected
  const {
    data: projectUsers,
    isLoading: isLoadingUsers,
    error: errorUsers,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ['ProjectTeam', resolve.resource.project_uuid, userType],
    queryFn: () =>
      userType === 'project-member' &&
      getAllPages((page) =>
        projectsListUsersList({
          path: { uuid: resolve.resource.project_uuid },
          query: {
            page,
            page_size: MAX_PAGE_SIZE,
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
    staleTime: UI_STALE_TIME,
  });

  const save = useCallback(
    async (formData) => {
      try {
        const body: any = {
          username:
            userType === 'project-member'
              ? formData.user?.user_username
              : formData.username,
          email:
            userType === 'project-member'
              ? formData.user?.user_email
              : formData.email,
          offering: resolve.offering.url,
          role: formData.role?.url,
        };
        if (resolve.resource) {
          body.resource = resolve.resource.url;
        }
        if (formData.scope_id) {
          body.scope_id = formData.scope_id;
        }
        if (formData.user?.user_uuid) {
          body.user = formData.user.user_uuid;
        }
        await offeringKeycloakMembershipsCreate({ body });
        showSuccess(translate('Resource access has been added.'));
        await resolve.refetch();
        closeDialog();
      } catch (error) {
        showErrorResponse(error, translate('Unable to add resource access.'));
      }
    },
    [resolve, userType, showSuccess, showErrorResponse, closeDialog],
  );

  const getRolesForScopeType = useCallback(
    (scopeType: string | undefined) => {
      if (!roles) return [];
      if (!scopeType) return roles.filter((r) => !r.scope_type);
      return roles.filter((r) => r.scope_type === scopeType);
    },
    [roles],
  );

  return (
    <Form onSubmit={save}>
      {({ handleSubmit, submitting, invalid, form, values }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Resource access')}
            subtitle={translate('Configure access permissions for a user')}
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
            <ToggleButtonGroup
              name="userType"
              value={userType}
              onChange={(value) => {
                if (value !== userType) {
                  form.change('username', undefined);
                  form.change('email', undefined);
                  form.change('user', undefined);
                }
                setUserType(value);
              }}
              type="radio"
              className="mb-6"
            >
              <ToggleButton
                value="project-member"
                id="user-type-project-member"
                variant="tertiary"
              >
                {translate('Project member')}
              </ToggleButton>
              <ToggleButton
                value="external-user"
                id="user-type-external-user"
                variant="tertiary"
              >
                {translate('External user')}
              </ToggleButton>
            </ToggleButtonGroup>

            {userType === 'project-member' && errorUsers && (
              <LoadingErred
                loadData={refetchUsers}
                message={translate('Unable to load project users')}
              />
            )}

            <div className="row">
              {userType === 'project-member' ? (
                <div className="col-md-6">
                  <FormGroup label={translate('User')} required>
                    <Field
                      name="user"
                      validate={required}
                      component={SelectField as any}
                      isLoading={isLoadingUsers}
                      options={projectUsers || []}
                      getOptionValue={(opt) => opt.user_username}
                      getOptionLabel={getOptionLabel}
                      components={{ Option: UserListOptionInline }}
                    />
                  </FormGroup>
                </div>
              ) : (
                <div className="col-md-6">
                  <FormGroup label={usernameLabel} required>
                    <Field
                      name="username"
                      validate={required}
                      component={StringField as any}
                      placeholder={usernameLabel}
                    />
                  </FormGroup>
                </div>
              )}
              <div className="col-md-6">
                <FormGroup label={translate('Email')}>
                  <Field
                    name="email"
                    component={EmailField as any}
                    placeholder="user@example.com"
                    disabled={userType === 'project-member'}
                    {...(userType === 'project-member' && values?.user
                      ? { input: { value: values.user.user_email } }
                      : {})}
                  />
                </FormGroup>
              </div>
            </div>

            <h6 className="mb-4">{translate('Permissions')}</h6>

            {errorRoles && (
              <LoadingErred
                loadData={refetchRoles}
                message={translate('Unable to load roles')}
              />
            )}

            {configurableScopeTypes.length > 0 && (
              <div className="row">
                <div className="col-md-6">
                  <FormGroup label={translate('Scope type')} required>
                    <Field
                      name="scope_type"
                      validate={required}
                      component={SelectField as any}
                      options={configurableScopeTypes}
                      getOptionValue={(opt) => opt.value}
                      getOptionLabel={(opt) => opt.label}
                      simpleValue
                      onChange={(newScopeType) => {
                        form.change('role', undefined);
                        const matching = availableScopes.filter(
                          (s) => s.scope_type === newScopeType,
                        );
                        form.change(
                          'scope_id',
                          matching.length === 1
                            ? matching[0].scope_id
                            : undefined,
                        );
                      }}
                    />
                  </FormGroup>
                </div>
                {values?.scope_type && (
                  <div className="col-md-6">
                    <FormGroup
                      label={
                        configurableScopeTypes.find(
                          (st) => st.value === values.scope_type,
                        )?.label || translate('Scope')
                      }
                      required
                    >
                      <Field
                        name="scope_id"
                        validate={required}
                        component={SelectField as any}
                        options={availableScopes.filter(
                          (s) => s.scope_type === values?.scope_type,
                        )}
                        getOptionValue={(opt: ScopeOption) => opt.scope_id}
                        getOptionLabel={(opt: ScopeOption) => opt.label}
                        simpleValue
                      />
                    </FormGroup>
                  </div>
                )}
              </div>
            )}

            <FormGroup label={translate('Role')} required>
              <Field
                name="role"
                validate={required}
                component={SelectField as any}
                isLoading={isLoadingRoles}
                options={
                  configurableScopeTypes.length > 0
                    ? getRolesForScopeType(values?.scope_type)
                    : (roles || []).filter((r) => !r.scope_type)
                }
                getOptionValue={(opt: OfferingUserRole) => opt.uuid}
                getOptionLabel={(opt: OfferingUserRole) => opt.name}
              />
            </FormGroup>
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
