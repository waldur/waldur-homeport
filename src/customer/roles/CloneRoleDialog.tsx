import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import { rolesCloneToCustomer } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { required } from '@/core/validators';
import { BooleanGroup, FormGroup, SelectGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Role } from '@/permissions/types';
import { getRoles } from '@/permissions/utils';

interface CloneRoleFormData {
  template: Role;
  conceal_template: boolean;
}

interface CloneRoleDialogResolve {
  customerUuid: string;
  refetch: () => void;
}

export const CloneRoleDialog: FC<{ resolve: CloneRoleDialogResolve }> = ({
  resolve,
}) => {
  // Templates are the deployment-wide (system) customer and project roles; the
  // clone copies the template's permissions and is usable only within this org.
  const templates = useMemo(
    () =>
      getRoles(['customer', 'project']).filter((role) => role.is_system_role),
    [],
  );

  const cloneMutation = useManagedMutation<any, any, CloneRoleFormData>({
    mutationFn: (values) =>
      rolesCloneToCustomer({
        path: { uuid: values.template.uuid },
        body: {
          customer: resolve.customerUuid,
          conceal_template: values.conceal_template,
        },
      }),
    successMessage: translate('Role has been cloned into the organization.'),
    errorMessage: translate('Unable to clone role.'),
    refetch: resolve.refetch,
    // Refresh the scoped role lists used by the Add member / Invite pickers.
    invalidateQueries: [{ queryKey: ['available-roles-for-customer'] }],
  });

  return (
    <Form<CloneRoleFormData>
      onSubmit={(values) => cloneMutation.mutateAsync(values)}
      initialValues={{ conceal_template: true }}
    >
      {({ handleSubmit, invalid, submitting, values }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Clone role into organization')}
            footer={
              <>
                <SubmitButton disabled={invalid} submitting={submitting}>
                  {translate('Clone')}
                </SubmitButton>
                <CloseDialogButton />
              </>
            }
          >
            <SelectGroup
              name="template"
              label={translate('Template role')}
              options={templates}
              getOptionLabel={(role: Role) => role.description || role.name}
              getOptionValue={(role: Role) => role.uuid}
              validate={required}
            />
            {values.template && (
              <FormGroup
                label={translate('Permissions')}
                description={translate('Copied from the template role.')}
              >
                {values.template.permissions?.length ? (
                  <div className="d-flex flex-wrap gap-1">
                    {values.template.permissions.map((permission) => (
                      <Badge key={permission} variant="secondary" outline>
                        {permission}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted">
                    {translate('This role has no permissions.')}
                  </span>
                )}
              </FormGroup>
            )}
            <BooleanGroup
              name="conceal_template"
              label={translate(
                'Conceal the original role in this organization (the clone replaces it)',
              )}
            />
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
