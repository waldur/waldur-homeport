import { FC } from 'react';
import { Form } from 'react-final-form';
import { CustomerUser, Project, User, projectsAddUser } from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { FieldError } from '@/form/FieldError';
import { FieldWarning } from '@/form/FieldWarning';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { getExistingRoleFeedback } from '@/permissions/existingRoles';
import { Role } from '@/permissions/types';
import { useExistingRoles } from '@/permissions/useExistingRoles';
import { ExpirationTimeGroup } from '@/project/team/ExpirationTimeGroup';
import {
  getOnlyOneProjectManagerTooltip,
  isProjectManagerSelectionBlocked,
} from '@/project/team/onlyOneProjectManager';
import { RoleGroup } from '@/project/team/RoleGroup';
import { useProjectHasActiveManager } from '@/project/team/useProjectHasActiveManager';
import { useCustomer, useUser } from '@/workspace/hooks';

import { OrganizationProjectSelectField } from './OrganizationProjectSelectField';
import { UserGroup } from './UserGroup';

interface AddProjectUserDialogFormData {
  role: Role;
  expiration_time: string;
  project: Project;
}

interface AddProjectUserDialogResolve {
  customer: CustomerUser;
  refetch;
}

interface AddProjectUserDialogProps {
  resolve: AddProjectUserDialogResolve;
}

const AddProjectUserDialogForm: FC<{
  resolve: AddProjectUserDialogResolve;
  updateMutation: ReturnType<
    typeof useManagedMutation<any, any, AddProjectUserDialogFormData>
  >;
}> = ({ resolve, updateMutation }) => {
  return (
    <Form<AddProjectUserDialogFormData>
      onSubmit={(values) => updateMutation.mutateAsync(values)}
      render={({ handleSubmit, invalid, values }) => (
        <AddProjectUserDialogFormBody
          handleSubmit={handleSubmit}
          invalid={invalid}
          values={values}
          resolve={resolve}
          updateMutation={updateMutation}
        />
      )}
    />
  );
};

const AddProjectUserDialogFormBody: FC<{
  handleSubmit: () => void;
  invalid: boolean;
  values: AddProjectUserDialogFormData;
  resolve: AddProjectUserDialogResolve;
  updateMutation: ReturnType<
    typeof useManagedMutation<any, any, AddProjectUserDialogFormData>
  >;
}> = ({ handleSubmit, invalid, values, resolve, updateMutation }) => {
  const currentUser = useUser() as User;
  const customer = useCustomer();
  const { data: hasActiveManager } = useProjectHasActiveManager(
    values.project?.uuid,
  );
  const isProjectManagerBlocked = isProjectManagerSelectionBlocked(
    hasActiveManager,
    values.role,
  );

  const { hits: existingRoles, isChecking: isCheckingExistingRoles } =
    useExistingRoles({
      role: values.role,
      userUuid: resolve.customer.uuid,
      scopeUuid: values.project?.uuid,
    });
  const existingRoleFeedback = getExistingRoleFeedback(existingRoles);
  // Hold the button while the lookup is in flight, otherwise a quick submit
  // slips through before the verdict arrives.
  const isExistingRoleBlocked =
    Boolean(existingRoleFeedback?.blocking) || isCheckingExistingRoles;

  return (
    <form onSubmit={handleSubmit}>
      <ModalDialog
        title={translate('Add project role')}
        subtitle={
          <ScopeSubtitle
            label={translate('Member')}
            name={resolve.customer.full_name || resolve.customer.username}
          />
        }
        footer={
          <>
            <CloseDialogButton />
            <SubmitButton
              submitting={updateMutation.isPending}
              disabled={
                invalid || isProjectManagerBlocked || isExistingRoleBlocked
              }
              disabledReason={
                isProjectManagerBlocked
                  ? getOnlyOneProjectManagerTooltip()
                  : isExistingRoleBlocked
                    ? (existingRoleFeedback?.message ??
                      translate('Checking the existing roles of this user...'))
                    : undefined
              }
              data-testid="submit-button"
            >
              {translate('Save')}
            </SubmitButton>
          </>
        }
      >
        <div className="size-sm">
          <UserGroup permission={resolve.customer} />
          <OrganizationProjectSelectField />
          <RoleGroup
            types={['project']}
            user={currentUser}
            scope={{
              customerId: customer?.uuid,
              projectId: values.project?.uuid,
            }}
          />
          {existingRoleFeedback &&
            (existingRoleFeedback.blocking ? (
              <FieldError error={existingRoleFeedback.message} />
            ) : (
              <FieldWarning error={existingRoleFeedback.message} />
            ))}
          <ExpirationTimeGroup disabled={updateMutation.isPending} />
        </div>
      </ModalDialog>
    </form>
  );
};

export const AddProjectUserDialog: FC<AddProjectUserDialogProps> = ({
  resolve,
}) => {
  const updateMutation = useManagedMutation<
    any,
    any,
    AddProjectUserDialogFormData
  >({
    mutationFn: (formData) =>
      projectsAddUser({
        path: { uuid: formData.project.uuid },
        body: {
          user: resolve.customer.uuid,
          role: formData.role.name,
          expiration_time: formData.expiration_time,
        },
      }),
    errorMessage: translate('Unable to update permission.'),
    refetch: resolve.refetch,
  });

  return (
    <AddProjectUserDialogForm
      resolve={resolve}
      updateMutation={updateMutation}
    />
  );
};
