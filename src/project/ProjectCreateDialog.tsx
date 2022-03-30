import { FC } from 'react';
import { Modal } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { ProjectCreateForm, ProjectCreateFormData } from './ProjectCreateForm';

interface ProjectCreateDialogProps {
  onSubmit(formData: ProjectCreateFormData): void;
  onCancel(): void;
  initialValues: ProjectCreateFormData;
}

export const ProjectCreateDialog: FC<ProjectCreateDialogProps> = (props) => {
  return (
    <>
      <Modal.Header>
        <Modal.Title>{translate('Create project')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ProjectCreateForm {...props} />
      </Modal.Body>
    </>
  );
};
