import { FC } from 'react';
import { Modal } from 'react-bootstrap';

import { RoleDescriptionForm } from '@waldur/administration/roles/RoleDescriptionForm';
import { translate } from '@waldur/i18n';

import { RoleForm } from './RoleForm';

interface RoleEditDialogProps {
  onSubmit(payload): void;
  onCancel(): void;
  resolve: { row; isDescriptionForm? };
}

export const RoleEditDialog: FC<RoleEditDialogProps> = (props) => {
  return (
    <>
      <Modal.Header>
        <Modal.Title>{translate('Edit role')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {props.resolve.isDescriptionForm ? (
          <RoleDescriptionForm
            {...props}
            initialValues={props.resolve.row}
            role={props.resolve.row}
          />
        ) : (
          <RoleForm
            {...props}
            initialValues={props.resolve.row}
            role={props.resolve.row}
          />
        )}
      </Modal.Body>
    </>
  );
};
