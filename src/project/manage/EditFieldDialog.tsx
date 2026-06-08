import { pick } from 'lodash-es';
import { Form } from 'react-final-form';
import { projectsPartialUpdate } from 'waldur-js-client';

import { SubmitButton, MarkdownGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useSetProject } from '@/workspace/hooks';

import { EditProjectProps } from '../types';

const getFieldTitle = (key: string): string => {
  switch (key) {
    case 'description':
      return translate('Description');
    case 'staff_notes':
      return translate('Staff notes');
    default:
      return translate('Edit');
  }
};

const formatValue = (key, value) => {
  if (['', undefined, null].includes(value)) {
    // For markdown fields, return empty string instead of null
    if (key === 'description' || key === 'staff_notes') {
      return '';
    }
    return null;
  }
  return value;
};

export const EditFieldDialog = ({ resolve }: { resolve: EditProjectProps }) => {
  const setCurrentProject = useSetProject();

  const updateMutation = useManagedMutation<any, any, FormData>({
    mutationFn: (formData) =>
      projectsPartialUpdate({
        path: { uuid: resolve.project.uuid },
        body: {
          [resolve.name]: formatValue(resolve.name, formData[resolve.name]),
        },
      }),
    successMessage: translate('Project has been updated.'),
    errorMessage: translate('Project could not be updated.'),
    onSuccess: (response: any) => {
      setCurrentProject(response.data);
    },
  });

  return (
    <Form
      onSubmit={(values: FormData) => updateMutation.mutateAsync(values)}
      initialValues={pick(resolve.project, resolve.name)}
      subscription={{
        values: true,
        invalid: true,
        dirty: true,
        submitting: true,
      }}
    >
      {({ invalid, handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={getFieldTitle(resolve.name)}
            footer={
              <>
                <CloseDialogButton className="flex-equal" />
                <SubmitButton
                  disabled={invalid}
                  submitting={submitting}
                  label={translate('Confirm')}
                  className="btn btn-primary flex-equal"
                />
              </>
            }
          >
            {resolve.name === 'description' ? (
              <MarkdownGroup
                name="description"
                label={translate('Description')}
              />
            ) : resolve.name === 'staff_notes' ? (
              <MarkdownGroup
                name="staff_notes"
                label={translate('Staff notes')}
              />
            ) : null}
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
