import { FC } from 'react';
import { ModalBody, ModalHeader, ModalTitle } from 'react-bootstrap';

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
      <ModalHeader>
        <ModalTitle>{translate('Create project')}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <ProjectCreateForm {...props} />
      </ModalBody>
    </>
  );
};
