import { UserPlusIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Form } from 'react-final-form';
import { proposalPublicCallsRetrieve, User } from 'waldur-js-client';

import { UI_STALE_TIME } from '@/core/constants';
import { required } from '@/core/validators';
import { AsyncSelectGroup, SelectGroup, SubmitButton } from '@/form';
import { FieldError } from '@/form/FieldError';
import { FieldWarning } from '@/form/FieldWarning';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ROLE_TYPES } from '@/permissions/constants';
import { getExistingRoleFeedback } from '@/permissions/existingRoles';
import { Role, RoleType } from '@/permissions/types';
import { useExistingRoles } from '@/permissions/useExistingRoles';
import { ExpirationTimeGroup } from '@/project/team/ExpirationTimeGroup';
import {
  getOnlyOneProjectManagerTooltip,
  isOnlyOneProjectManagerEnabled,
  isProjectManagerRole,
  isProjectManagerSelectionBlocked,
} from '@/project/team/onlyOneProjectManager';
import { RoleGroup } from '@/project/team/RoleGroup';
import { useProjectHasActiveManager } from '@/project/team/useProjectHasActiveManager';
import { getCurrentUser } from '@/user/UsersService';
import { useSetUser, useUser } from '@/workspace/hooks';

import { grantScopeLoaders } from './grantScopeLoaders';
import {
  grantSiteRole,
  grantUserRole,
  isGrantableScopeType,
} from './grantUserRole';

interface AddUserRoleFormValues {
  scope_type?: RoleType;
  scope?: {
    uuid: string;
    name?: string;
    customer_name?: string;
    customer_uuid?: string;
    call_uuid?: string;
  };
  role?: Role;
  expiration_time?: string;
}

interface AddUserRoleDialogProps {
  resolve: {
    // full_name is absent for some accounts; the title falls back to username.
    user: Pick<User, 'uuid' | 'username'> & { full_name?: string };
    refetch?: () => void;
  };
}

const emptyScopeLoader = () =>
  Promise.resolve({ options: [], hasMore: false, additional: { page: 1 } });

const getScopeLabel = (option: { name?: string; customer_name?: string }) =>
  option.name || option.customer_name;

export const AddUserRoleDialog: FC<AddUserRoleDialogProps> = ({
  resolve: { user, refetch },
}) => {
  const currentUser = useUser();
  const setCurrentUser = useSetUser();
  const userLabel = user.full_name || user.username;

  const grantMutation = useManagedMutation<any, any, AddUserRoleFormValues>({
    mutationFn: async (formData) => {
      const body = {
        user: user.uuid,
        role: formData.role?.name,
        expiration_time: formData.expiration_time,
      };
      let result;
      if (formData.scope_type === 'global' && body.role) {
        result = await grantSiteRole(body);
      } else if (
        formData.scope_type &&
        isGrantableScopeType(formData.scope_type) &&
        formData.scope?.uuid &&
        body.role
      ) {
        result = await grantUserRole(
          formData.scope_type,
          formData.scope.uuid,
          body,
        );
      } else {
        return Promise.reject(new Error('Incomplete role grant'));
      }
      // A grant to the signed-in user changes the permissions the session
      // already holds. Refreshing after a failed lookup must not report the
      // grant itself as failed, or a retry creates a duplicate.
      if (currentUser?.uuid === user.uuid) {
        try {
          setCurrentUser(await getCurrentUser());
        } catch {
          // The role is already stored. The session stays stale until reload.
        }
      }
      return result;
    },
    successMessage: translate('Role has been added.'),
    errorMessage: translate('Unable to add role.'),
    refetch,
  });

  return (
    <Form<AddUserRoleFormValues>
      onSubmit={(values) => grantMutation.mutateAsync(values)}
    >
      {({ handleSubmit, submitting, invalid, values, form }) => (
        <AddUserRoleForm
          handleSubmit={handleSubmit}
          submitting={submitting}
          invalid={invalid}
          values={values}
          userLabel={userLabel}
          userUuid={user.uuid}
          currentUser={currentUser}
          onScopeTypeChange={() => {
            form.change('scope', undefined);
            form.change('role', undefined);
          }}
          onScopeChange={() => form.change('role', undefined)}
        />
      )}
    </Form>
  );
};

interface AddUserRoleFormProps {
  handleSubmit: () => void;
  submitting: boolean;
  invalid: boolean;
  values: AddUserRoleFormValues;
  userLabel: string;
  userUuid: string;
  currentUser: ReturnType<typeof useUser>;
  onScopeTypeChange: () => void;
  onScopeChange: () => void;
}

const AddUserRoleForm: FC<AddUserRoleFormProps> = ({
  handleSubmit,
  submitting,
  invalid,
  values,
  userLabel,
  userUuid,
  currentUser,
  onScopeTypeChange,
  onScopeChange,
}) => {
  const scopeType = values.scope_type;
  const scopeUuid = values.scope?.uuid;
  // A site-wide role is granted on the one site scope, so there is nothing to
  // pick between the type and the role.
  const isSiteWide = scopeType === 'global';
  const projectUuid = scopeType === 'project' ? scopeUuid : undefined;
  // A proposal row has no customer of its own. The call it belongs to does,
  // and that is the organization whose proposal roles should be offered.
  const proposalCallUuid =
    scopeType === 'proposal' ? values.scope?.call_uuid : undefined;
  const { data: proposalCustomerUuid, isPending: isProposalCustomerPending } =
    useQuery({
      queryKey: ['proposal-call-customer', proposalCallUuid],
      queryFn: () =>
        proposalPublicCallsRetrieve({
          path: { uuid: proposalCallUuid! },
        }).then((response) => response.data.customer_uuid),
      enabled: Boolean(proposalCallUuid),
      staleTime: UI_STALE_TIME,
    });
  // Organization roles (and an organization's copies of system roles) are
  // listed for the owning customer. A customer scope is that customer; every
  // other scope carries customer_uuid when the list endpoint includes it.
  const customerId =
    scopeType === 'customer'
      ? scopeUuid
      : values.scope?.customer_uuid || proposalCustomerUuid;
  const isProposalCustomerLoading =
    Boolean(proposalCallUuid) &&
    !values.scope?.customer_uuid &&
    isProposalCustomerPending;

  const { data: projectHasManager, isPending: isCheckingManager } =
    useProjectHasActiveManager(projectUuid);
  // The setting is not a staff override. The API rejects a second manager
  // for every caller, so the form blocks the same selection.
  const needsManagerCheck =
    isOnlyOneProjectManagerEnabled() &&
    isProjectManagerRole(values.role) &&
    Boolean(projectUuid);
  const isProjectManagerBlocked =
    isProjectManagerSelectionBlocked(projectHasManager, values.role) ||
    (needsManagerCheck && isCheckingManager);

  const { hits: existingRoles, isChecking: isCheckingExistingRoles } =
    useExistingRoles({
      role: values.role,
      userUuid,
      scopeUuid,
    });
  const existingRoleFeedback = getExistingRoleFeedback(existingRoles);
  const isExistingRoleBlocked =
    Boolean(existingRoleFeedback?.blocking) || isCheckingExistingRoles;
  const canGrant = Boolean(currentUser?.is_staff);

  return (
    <form onSubmit={handleSubmit}>
      <ModalDialog
        title={translate('Add role to {name}', { name: userLabel })}
        iconNode={<UserPlusIcon weight="bold" />}
        iconColor="success"
        footer={
          <>
            <CloseDialogButton />
            <SubmitButton
              submitting={submitting}
              variant="primary"
              disabled={
                invalid ||
                !canGrant ||
                isProjectManagerBlocked ||
                isExistingRoleBlocked
              }
              disabledReason={
                !canGrant
                  ? translate('Only staff can add roles.')
                  : isProjectManagerBlocked
                    ? getOnlyOneProjectManagerTooltip()
                    : isExistingRoleBlocked
                      ? (existingRoleFeedback?.message ??
                        translate(
                          'Checking the existing roles of this user...',
                        ))
                      : invalid
                        ? translate('Select a scope and a role.')
                        : undefined
              }
              label={translate('Confirm')}
            />
          </>
        }
      >
        <SelectGroup
          name="scope_type"
          simpleValue
          options={ROLE_TYPES}
          validate={required}
          required
          label={translate('Scope type')}
          placeholder={translate('Select...')}
          onChange={onScopeTypeChange}
        />
        {!isSiteWide && (
          <AsyncSelectGroup
            key={scopeType || 'none'}
            name="scope"
            label={translate('Scope')}
            required
            validate={required}
            isDisabled={!scopeType}
            placeholder={
              scopeType
                ? translate('Select...')
                : translate('Select scope type first')
            }
            loadOptions={
              scopeType && grantScopeLoaders[scopeType]
                ? grantScopeLoaders[scopeType]
                : emptyScopeLoader
            }
            getOptionValue={(option) => option.uuid}
            getOptionLabel={getScopeLabel}
            defaultOptions={Boolean(scopeType)}
            onChange={onScopeChange}
          />
        )}
        {isSiteWide ? (
          <RoleGroup types={['global']} user={currentUser} />
        ) : scopeUuid && scopeType && !isProposalCustomerLoading ? (
          <RoleGroup
            types={[scopeType]}
            user={currentUser}
            scope={{
              customerId,
              projectId: scopeType === 'project' ? scopeUuid : undefined,
              callOrganizerId:
                scopeType === 'call_organizer' ? scopeUuid : undefined,
            }}
          />
        ) : (
          <SelectGroup
            name="role"
            label={translate('Role')}
            options={[]}
            isDisabled
            placeholder={translate('Select scope first')}
            required
            validate={required}
          />
        )}
        {existingRoleFeedback &&
          (existingRoleFeedback.blocking ? (
            <FieldError error={existingRoleFeedback.message} />
          ) : (
            <FieldWarning error={existingRoleFeedback.message} />
          ))}
        <ExpirationTimeGroup />
      </ModalDialog>
    </form>
  );
};
