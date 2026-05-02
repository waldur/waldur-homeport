import { FunctionComponent } from 'react';
import { Field, Form } from 'react-final-form';
import { projectsMoveProject } from 'waldur-js-client';

import { format } from '@/core/ErrorMessageFormatter';
import { required } from '@/core/validators';
import { SubmitButton } from '@/form';
import { Select } from '@/form/AsyncSelectField';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { translate } from '@/i18n';
import { organizationAutocomplete } from '@/marketplace/common/autocompletes';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';

export const MoveProjectDialog: FunctionComponent<{
  resolve: { project; refetch };
}> = ({ resolve: { project, refetch } }) => {
  const { showError, showSuccess } = useNotify();

  const moveProjectMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) =>
      projectsMoveProject({
        path: { uuid: project.uuid },
        body: {
          customer: formData.organization.url,
          preserve_permissions: formData.preserve_permissions,
        },
      }),
    refetch,
    onSuccess: (_data, formData) => {
      showSuccess(
        translate(
          '{projectName} project has been moved to {organizationName} organization.',
          {
            projectName: project.name,
            organizationName: formData.organization.name,
          },
        ),
      );
    },
    onError: (error) => {
      const errorMessage = `${translate('Project could not be moved.')} ${format(error)}`;
      showError(errorMessage);
    },
  });

  return (
    <Form
      onSubmit={(values) => moveProjectMutation.mutateAsync(values)}
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
