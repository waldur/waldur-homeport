import { FC } from 'react';
import { Form } from 'react-final-form';
import { CustomerUser, Project, projectsAddUser } from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Role } from '@/permissions/types';
import { ExpirationTimeGroup } from '@/project/team/ExpirationTimeGroup';
import {
  getOnlyOneProjectManagerTooltip,
  isProjectManagerSelectionBlocked,
} from '@/project/team/onlyOneProjectManager';
import { RoleGroup } from '@/project/team/RoleGroup';
import { useProjectHasActiveManager } from '@/project/team/useProjectHasActiveManager';

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
  const { data: hasActiveManager } = useProjectHasActiveManager(
    values.project?.uuid,
  );
  const isProjectManagerBlocked = isProjectManagerSelectionBlocked(
    hasActiveManager,
    values.role,
  );

  return (
    <form onSubmit={handleSubmit}>
      <ModalDialog
        title={translate('Add project role')}
        footer={
          <>
            <CloseDialogButton />
            <SubmitButton
              submitting={updateMutation.isPending}
              disabled={invalid || isProjectManagerBlocked}
              disabledReason={
                isProjectManagerBlocked
                  ? getOnlyOneProjectManagerTooltip()
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
          <RoleGroup types={['project']} />
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
