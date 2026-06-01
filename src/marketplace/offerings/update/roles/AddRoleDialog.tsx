import { FC } from 'react';
import { Form } from 'react-final-form';
import { marketplaceOfferingRolesCreate } from 'waldur-js-client';

import { required } from '@/core/validators';
import { SubmitButton, StringGroup, SelectGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

const SCOPE_OPTIONS = [
  { value: 'resource', label: translate('Resource') },
  { value: 'resource_project', label: translate('Resource project') },
];

interface AddRoleResolve {
  offering: { uuid: string; name?: string };
  refetch(): void;
}

export const AddRoleDialog: FC<{ resolve: AddRoleResolve }> = ({ resolve }) => {
  const addRoleMutation = useManagedMutation<
    any,
    any,
    { name: string; scope: any; description?: string }
  >({
    mutationFn: (formData) =>
      marketplaceOfferingRolesCreate({
        body: {
          offering: resolve.offering.uuid,
          name: formData.name,
          content_type_input: formData.scope?.value || 'resource_project',
          description: formData.description || '',
        },
      }),
    successMessage: translate('Role has been added successfully.'),
    errorMessage: translate('Unable to add role.'),
    refetch: resolve.refetch,
  });

  return (
    <Form
      onSubmit={(values: any) =>
        addRoleMutation.mutateAsync(values).catch(() => {
          /* handled */
        })
      }
      initialValues={{ scope: SCOPE_OPTIONS[1] }}
    >
      {({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Add role')}
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  disabled={invalid}
                  submitting={submitting}
                  label={translate('Create')}
                  className="btn btn-primary"
                />
              </>
            }
          >
            <StringGroup
              name="name"
              validate={required}
              placeholder={translate('e.g. Cluster Admin, Project Member')}
              label={translate('Role name')}
              required
            />
            <SelectGroup
              name="scope"
              validate={required}
              options={SCOPE_OPTIONS}
              getOptionValue={(o) => o.value}
              getOptionLabel={(o) => o.label}
              label={translate('Scope')}
              description={translate(
                'Whether the role is granted on the whole resource or on individual resource sub-projects.',
              )}
              required
            />
            <StringGroup
              name="description"
              placeholder={translate('Role description (optional)')}
              label={translate('Description')}
            />
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
