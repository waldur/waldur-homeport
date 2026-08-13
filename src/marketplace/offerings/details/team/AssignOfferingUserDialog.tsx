import { UserCirclePlusIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Form } from 'react-final-form';
import {
  marketplaceProviderOfferingsAddUser,
  ProviderOfferingDetails as Offering,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { usersAutocomplete } from '@/customer/team/utils';
import { AsyncSelectGroup, FormGroup, SelectGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Role } from '@/permissions/types';
import { ExpirationTimeGroup } from '@/project/team/ExpirationTimeGroup';
import { UserListOptionInline } from '@/project/team/UserListOptionInline';

import { useOfferingRoles } from './useOfferingRoles';

interface AssignOfferingUserResolve {
  offering: Offering;
  refetch(): void;
}

interface FormData {
  user: { uuid: string };
  role: Role;
  expiration_time?: string;
}

const getOptionLabel = (option) =>
  option.email
    ? (option.full_name || option.username) + ` (${option.email})`
    : option.full_name || option.username;

/**
 * Assign an existing user a role on the offering. The role list comes from the
 * backend rather than being fixed to `OFFERING.MANAGER`, so an organization's
 * private offering-role clones are grantable too.
 */
export const AssignOfferingUserDialog: FC<{
  resolve: AssignOfferingUserResolve;
}> = ({ resolve: { offering, refetch } }) => {
  const { data: roles = [], isLoading: rolesLoading } = useOfferingRoles(
    offering.customer_uuid,
  );

  const assignMutation = useManagedMutation<any, any, FormData>({
    mutationFn: (formData) =>
      marketplaceProviderOfferingsAddUser({
        path: { uuid: offering.uuid },
        body: {
          user: formData.user.uuid,
          role: formData.role.uuid,
          expiration_time: formData.expiration_time,
        } as any,
      }),
    successMessage: translate('Role has been granted.'),
    errorMessage: translate('Unable to grant role.'),
    refetch,
  });

  // A single available role is not a choice — preselect it and hide the picker,
  // the way the calls team dialog does.
  const initialValues = roles.length === 1 ? { role: roles[0] } : undefined;

  return (
    <Form<FormData>
      onSubmit={(values) =>
        assignMutation.mutateAsync(values).catch(() => {
          /* handled by useManagedMutation */
        })
      }
      initialValues={initialValues}
    >
      {({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Add member')}
            subtitle={translate('Select a user and assign a role.')}
            iconNode={<UserCirclePlusIcon weight="bold" />}
            iconColor="success"
            footer={
              <>
                <CloseDialogButton className="min-w-125px" />
                <SubmitButton
                  label={translate('Add role')}
                  submitting={submitting}
                  disabled={invalid || rolesLoading || roles.length === 0}
                  className="btn btn-primary min-w-125px"
                />
              </>
            }
          >
            <AsyncSelectGroup
              label={translate('User')}
              required
              name="user"
              placeholder={translate('Search and select user...')}
              loadOptions={usersAutocomplete}
              getOptionValue={(option) => option.uuid}
              getOptionLabel={getOptionLabel}
              components={{ Option: UserListOptionInline }}
              validate={required}
            />

            {roles.length > 1 ? (
              <SelectGroup
                name="role"
                label={translate('Role')}
                required
                validate={required}
                options={roles}
                getOptionValue={(option) => option.uuid}
                getOptionLabel={(option) => option.description || option.name}
              />
            ) : roles.length === 0 && !rolesLoading ? (
              <FormGroup label={translate('Role')} required>
                <p className="text-muted mb-0">
                  {translate(
                    'No roles are available for this offering in your organization.',
                  )}
                </p>
              </FormGroup>
            ) : null}

            <ExpirationTimeGroup />
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
