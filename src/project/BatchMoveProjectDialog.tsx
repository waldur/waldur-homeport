import { FunctionComponent, useMemo } from 'react';
import { Form } from 'react-final-form';
import { Project, projectsMoveProject } from 'waldur-js-client';

import { required } from '@/core/validators';
import { AsyncSelectGroup, BooleanGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { organizationAutocomplete } from '@/marketplace/common/autocompletes';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useBatchMutation } from '@/modal/useBatchMutation';

export const BatchMoveProjectDialog: FunctionComponent<{
  resolve: { rows: Project[]; refetch() };
}> = ({ resolve: { rows, refetch } }) => {
  const loadOrganizations = useMemo(
    () =>
      organizationAutocomplete({
        field: ['name', 'url', 'abbreviation'],
        o: 'name',
        current_user_has_project_create_permission: true,
      }),
    [],
  );

  const { mutate, isPending } = useBatchMutation({
    rows,
    refetch,
    mutationFn: (project, formData) =>
      projectsMoveProject({
        path: { uuid: project.uuid },
        body: {
          customer: formData.organization.url,
          preserve_permissions: formData.preserve_permissions,
        },
      }),
    successMessage: (formData) =>
      translate('{count} project(s) moved to {organizationName}.', {
        count: rows.length,
        organizationName: formData.organization.name,
      }),
    renderPartialSuccessMessage: (count, formData) =>
      translate('{count} project(s) moved to {organizationName}.', {
        count,
        organizationName: formData.organization.name,
      }),
    renderErrorMessage: (count) =>
      translate('{count} project(s) could not be moved.', {
        count,
      }),
  });

  return (
    <Form
      onSubmit={(formData) => mutate(formData)}
      initialValues={{ preserve_permissions: false }}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Move {count} project(s) to organization', {
              count: rows.length,
            })}
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  submitting={submitting || isPending}
                  label={translate('Move')}
                  disabled={invalid}
                />
              </>
            }
          >
            <FormGroup label={translate('Selected projects')}>
              <ul className="list-group">
                {rows.map((project) => (
                  <li key={project.uuid} className="list-group-item py-2">
                    {project.name}
                  </li>
                ))}
              </ul>
            </FormGroup>
            <AsyncSelectGroup
              name="organization"
              label={translate('Move to organization')}
              required
              validate={required}
              placeholder={translate('Select organization...')}
              loadOptions={loadOrganizations}
              getOptionLabel={(option) =>
                option.name +
                (option.abbreviation ? ` (${option.abbreviation})` : '')
              }
              getOptionValue={(option) => option.url}
              noOptionsMessage={() => translate('No organizations')}
              isDisabled={submitting}
            />
            <BooleanGroup
              name="preserve_permissions"
              label={translate('Preserve project permissions')}
              description={translate(
                'Keep existing project permissions when moving to a new organization',
              )}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
