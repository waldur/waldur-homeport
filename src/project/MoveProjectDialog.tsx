import { FunctionComponent, useCallback } from 'react';
import { Field, Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { projectsMoveProject } from 'waldur-js-client';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { required } from '@waldur/core/validators';
import { SubmitButton } from '@waldur/form';
import { Select } from '@waldur/form/AsyncSelectField';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { organizationAutocomplete } from '@waldur/marketplace/common/autocompletes';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showError, showSuccess } from '@waldur/store/notify';

export const MoveProjectDialog: FunctionComponent<{
  resolve: { project; refetch };
}> = ({ resolve: { project, refetch } }) => {
  const dispatch = useDispatch();
  const onSubmit = useCallback(
    async (formData) => {
      try {
        await projectsMoveProject({
          path: { uuid: project.uuid },
          body: {
            customer: formData.organization.url,
            preserve_permissions: formData.preserve_permissions,
          },
        });
        dispatch(
          showSuccess(
            translate(
              '{projectName} project has been moved to {organizationName} organization.',
              {
                projectName: project.name,
                organizationName: formData.organization.name,
              },
            ),
          ),
        );
        await refetch();
        dispatch(closeModalDialog());
      } catch (error) {
        const errorMessage = `${translate('Project could not be moved.')} ${format(error)}`;
        dispatch(showError(errorMessage));
      }
    },
    [dispatch, project],
  );

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={{ preserve_permissions: false }}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Move project {projectName}', {
              projectName: project.name,
            })}
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  submitting={submitting}
                  label={translate('Save')}
                  disabled={invalid}
                />
              </>
            }
          >
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
