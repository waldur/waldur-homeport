import { FunctionComponent } from 'react';
import { Modal } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';

import { UserDetailsTable } from './UserDetailsTable';

export const UserDetailsDialog: FunctionComponent<{ resolve }> = ({
  resolve,
}) => {
  return (
    <>
      <Modal.Header>
        <Modal.Title>{translate('User details')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <UserDetailsTable user={resolve.user} />
      </Modal.Body>
      <Modal.Footer>
        <CloseDialogButton />
      </Modal.Footer>
    </>
  );
};
