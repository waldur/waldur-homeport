import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  marketplaceOfferingRolesList,
  marketplaceResourceProjectsAddUser,
  marketplaceResourcesAddUser,
  usersList,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { SubmitButton, SelectGroup, AsyncSelectGroup } from '@/form';
import { createLoadOptions } from '@/form/select';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

type Scope = 'resource' | 'resource_project';

interface AddUserResolve {
  scope: Scope;
  scopeUuid: string;
  projectUuid: string;
  offering: { uuid?: string };
  refetch(): void;
}

export const AddUserDialog: FC<{ resolve: AddUserResolve }> = ({ resolve }) => {
  const targetContentType =
    resolve.scope === 'resource_project' ? 'resource_project' : 'resource';

  const { data: filteredRoles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['offeringRoles', resolve.offering?.uuid, targetContentType],
    queryFn: async () => {
      if (!resolve.offering?.uuid) return [];
      const response = await marketplaceOfferingRolesList({
        query: {
          offering_uuid: resolve.offering.uuid,
          page_size: 100,
        },
      });
      const all = response.data || [];
      return all.filter(
        (r: any) => !r.content_type || r.content_type === targetContentType,
      );
    },
  });

  const assignMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) => {
      const apiFn =
        resolve.scope === 'resource_project'
          ? marketplaceResourceProjectsAddUser
          : marketplaceResourcesAddUser;
      return apiFn({
        path: { uuid: resolve.scopeUuid },
        body: {
          user: formData.user.uuid,
          role: formData.role.uuid,
        },
      });
    },
    successMessage: translate('User has been assigned successfully.'),
    errorMessage: translate('Unable to assign user.'),
    refetch: resolve.refetch,
  });

  const loadUsers = useMemo(
    () =>
      createLoadOptions(usersList, 'full_name', {
        project_uuid: resolve.projectUuid,
        field: ['full_name', 'email', 'url', 'uuid'],
        o: ['full_name'],
      }),
    [resolve.projectUuid],
  );

  return (
    <Form
      onSubmit={(values) =>
        assignMutation.mutateAsync(values).catch(() => {
          /* handled */
        })
      }
    >
      {({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Assign user')}
            footer={
              <>
                <CloseDialogButton className="min-w-125px" />
                <SubmitButton
                  label={translate('Assign')}
                  submitting={submitting}
                  disabled={
                    invalid || rolesLoading || filteredRoles.length === 0
                  }
                  className="btn btn-primary min-w-125px"
                />
              </>
            }
          >
            <AsyncSelectGroup
              label={translate('User')}
              required
              name="user"
              placeholder={translate('Select user...')}
              loadOptions={loadUsers}
              getOptionLabel={({ full_name, email }) =>
                `${full_name} (${email})`
              }
              getOptionValue={({ uuid }) => uuid}
              validate={required}
            />
            {filteredRoles.length > 0 ? (
              <SelectGroup
                name="role"
                validate={required}
                options={filteredRoles}
                getOptionValue={(option) => option.uuid}
                getOptionLabel={(option) => option.name}
                label={translate('Role')}
                required
              />
            ) : (
              <FormGroup label={translate('Role')} required>
                <p className="text-muted mb-0">
                  {resolve.scope === 'resource_project'
                    ? translate(
                        'No roles have been set up for project members yet. The service provider needs to add at least one role before users can be invited.',
                      )
                    : translate(
                        'No roles have been set up for this resource yet. Ask the service provider to add a role, or grant access at the project level on the Resource projects tab.',
                      )}
                </p>
              </FormGroup>
            )}
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
