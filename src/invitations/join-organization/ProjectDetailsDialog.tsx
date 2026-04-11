import { FC, useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { Form, Field } from 'react-final-form';
import { useDispatch } from 'react-redux';

import { StringField, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';

interface ProjectDetailsDialogProps {
  resolve: {
    onSubmit: (data: {
      project_name?: string;
      project_description?: string;
    }) => void;
    onCancel?: () => void;
    defaultProjectName?: string;
  };
}

export const ProjectDetailsDialog: FC<ProjectDetailsDialogProps> = ({
  resolve,
}) => {
  const dispatch = useDispatch();

  const onSubmit = useCallback(
    (formData) => {
      dispatch(closeModalDialog());
      resolve.onSubmit({
        project_name: formData.project_name || '',
        project_description: formData.project_description || '',
      });
    },
    [resolve, dispatch],
  );

  const onCancel = useCallback(() => {
    dispatch(closeModalDialog());
    resolve.onCancel?.();
  }, [resolve, dispatch]);

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={{ project_name: resolve.defaultProjectName || '' }}
    >
      {({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Project details')}
            subtitle={translate(
              'Optionally customize the name and description of the project that will be created for you.',
            )}
            footer={
              <>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onCancel}
                >
                  {translate('Cancel')}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {translate('Submit request')}
                </button>
              </>
            }
          >
            <Modal.Body>
              <FormGroup label={translate('Project name')}>
                <Field
                  name="project_name"
                  component={StringField as any}
                  placeholder={translate('Leave empty for auto-generated name')}
                />
              </FormGroup>
              <FormGroup label={translate('Project description')} spaceless>
                <Field
                  name="project_description"
                  component={TextField as any}
                  placeholder={translate('Optional description')}
                />
              </FormGroup>
            </Modal.Body>
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
