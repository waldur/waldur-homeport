import { FC, useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { Form } from 'react-final-form';

import { StringGroup, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';

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
  const { closeDialog } = useModal();

  const onSubmit = useCallback(
    (formData) => {
      closeDialog();
      resolve.onSubmit({
        project_name: formData.project_name || '',
        project_description: formData.project_description || '',
      });
    },
    [resolve],
  );

  const onCancel = useCallback(() => {
    closeDialog();
    resolve.onCancel?.();
  }, [resolve]);

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
              <StringGroup
                name="project_name"
                placeholder={translate('Leave empty for auto-generated name')}
                label={translate('Project name')}
              />
              <TextGroup
                name="project_description"
                placeholder={translate('Optional description')}
                label={translate('Project description')}
                spaceless
              />
            </Modal.Body>
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
