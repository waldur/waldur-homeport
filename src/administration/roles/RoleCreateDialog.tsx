import { FC } from 'react';
import { Modal } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { RoleForm } from './RoleForm';

interface RoleCreateDialogProps {
  onSubmit(payload): void;
  onCancel(): void;
}

export const RoleCreateDialog: FC<RoleCreateDialogProps> = (props) => (
  <>
    <Modal.Header>
      <Modal.Title>{translate('New role')}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <RoleForm {...props} />
    </Modal.Body>
  </>
);
