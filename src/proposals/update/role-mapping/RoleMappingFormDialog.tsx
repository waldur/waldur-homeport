import { PlusCircleIcon } from '@phosphor-icons/react';
import { Field, Form } from 'react-final-form';
import {
  callProposalProjectRoleMappingsCreate,
  callProposalProjectRoleMappingsPartialUpdate,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { FormGroup, SelectField, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import {
  formatRole,
  getProjectRoles,
  getProposalRoles,
} from '@/permissions/utils';

export const RoleMappingFormDialog = ({ resolve }) => {
  const isEdit = Boolean(resolve.mapping);
  const proposalRoleOptions = getProposalRoles();
  const projectRoleOptions = getProjectRoles();

  // Helper to find option object by name for initial values
  const findOption = (options, value) =>
    options.find(
      (option) =>
        option.name === (typeof value === 'object' ? value.name : value),
    );

  const initialValues = isEdit
    ? {
        proposal_role: findOption(
          proposalRoleOptions,
          resolve.mapping.proposal_role,
        ),
        project_role: resolve.mapping.project_role
          ? findOption(projectRoleOptions, resolve.mapping.project_role)
          : null,
      }
    : undefined;

  const saveRoleMappingMutation = useManagedMutation<any, any, any>({
    mutationFn: (formValues) => {
      if (isEdit) {
        return callProposalProjectRoleMappingsPartialUpdate({
          path: { uuid: resolve.mapping.uuid },
          body: {
            project_role: formValues.project_role?.name || null,
          },
        });
      } else {
        return callProposalProjectRoleMappingsCreate({
          body: {
            call: resolve.call.url,
            project_role: formValues.project_role?.name || null,
            proposal_role: formValues.proposal_role.name,
          },
        });
      }
    },
    successMessage: isEdit
      ? translate('Role mapping has been updated')
      : translate('Role mapping has been created'),
    errorMessage: isEdit
      ? translate('Unable to update the role mapping.')
      : translate('Unable to create a role mapping.'),
    refetch: resolve.refetch,
  });

  return (
    <Form
      initialValues={initialValues}
      onSubmit={(values) => saveRoleMappingMutation.mutateAsync(values)}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit role mapping for {proposalRole}', {
                    proposalRole: formatRole(initialValues.proposal_role),
                  })
                : translate('Create role mapping')
            }
            subtitle={translate(
              'If the project role is not set, corresponding users in proposal role will not be transferred to the project.',
            )}
            iconNode={!isEdit ? <PlusCircleIcon weight="bold" /> : null}
            iconColor={isEdit ? 'warning' : 'success'}
            footer={
              <>
                <CloseDialogButton className="min-w-125px" />
                <SubmitButton
                  submitting={submitting}
                  disabled={invalid}
                  label={isEdit ? translate('Update') : translate('Create')}
                  className="btn btn-primary min-w-125px"
                />
              </>
            }
          >
            {!isEdit ? (
              <Field
                name="proposal_role"
                label={translate('Proposal role')}
                component={FormGroup as any}
                options={proposalRoleOptions}
                getOptionLabel={(option) => option.label || option.name}
                getOptionValue={(option) => option.name}
                validate={required}
                isClearable={false}
              >
                <SelectField />
              </Field>
            ) : null}
            <Field
              name="project_role"
              label={translate('Project role')}
              component={FormGroup as any}
              options={projectRoleOptions}
              getOptionLabel={(option) => option.label || option.name}
              getOptionValue={(option) => option.name || null}
              isClearable={true}
            >
              <SelectField />
            </Field>
          </ModalDialog>
        </form>
      )}
    />
  );
};
