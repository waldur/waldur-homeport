import { FunctionComponent, useCallback } from 'react';
import { Field, Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { Project, projectsMoveProject } from 'waldur-js-client';

import { format } from '@/core/ErrorMessageFormatter';
import { required } from '@/core/validators';
import { SubmitButton } from '@/form';
import { Select } from '@/form/AsyncSelectField';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { translate } from '@/i18n';
import { organizationAutocomplete } from '@/marketplace/common/autocompletes';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { closeModalDialog } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { showError, showSuccess } from '@/store/notify';

export const BatchMoveProjectDialog: FunctionComponent<{
  resolve: { rows: Project[]; refetch() };
}> = ({ resolve: { rows, refetch } }) => {
  const dispatch = useDispatch();
  const onSubmit = useCallback(
    async (formData) => {
      const results = await Promise.allSettled(
        rows.map((project) =>
          projectsMoveProject({
            path: { uuid: project.uuid },
            body: {
              customer: formData.organization.url,
              preserve_permissions: formData.preserve_permissions,
            },
          }),
        ),
      );
      const succeeded = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected');
      if (succeeded > 0) {
        dispatch(
          showSuccess(
            translate('{count} project(s) moved to {organizationName}.', {
              count: succeeded,
              organizationName: formData.organization.name,
            }),
          ),
        );
      }
      if (failed.length > 0) {
        const errorMessage = format(
          (failed[0] as PromiseRejectedResult).reason,
        );
        dispatch(
          showError(
            translate('{count} project(s) could not be moved. {error}', {
              count: failed.length,
              error: errorMessage,
            }),
          ),
        );
      }
      await refetch();
      dispatch(closeModalDialog());
    },
    [dispatch, rows, refetch],
  );

  return (
    <Form
      onSubmit={onSubmit}
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
                  submitting={submitting}
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
            <FormGroup label={translate('Move to organization')} required>
              <Field
                component={Select as any}
                name="organization"
                validate={required}
                placeholder={translate('Select organization...')}
                loadOptions={(query, prevOptions, page) =>
                  organizationAutocomplete(query, prevOptions, page, {
                    field: ['name', 'url', 'abbreviation'],
                    o: 'name',
                    current_user_has_project_create_permission: true,
                  })
                }
                getOptionLabel={(option) =>
                  option.name +
                  (option.abbreviation ? ` (${option.abbreviation})` : '')
                }
                getOptionValue={(option) => option.url}
                noOptionsMessage={() => translate('No organizations')}
                isDisabled={submitting}
              />
            </FormGroup>
            <FormGroup>
              <Field
                component={AwesomeCheckboxField as any}
                name="preserve_permissions"
                label={translate('Preserve project permissions')}
                description={translate(
                  'Keep existing project permissions when moving to a new organization',
                )}
              />
            </FormGroup>
          </ModalDialog>
        </form>
      )}
    />
  );
};
