import React from 'react';
import {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';

import { UserDetailsTable } from './UserDetailsTable';

export const UserDetailsDialog = ({ resolve }) => {
  return (
    <>
      <ModalHeader>
        <ModalTitle>{translate('User details')}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <UserDetailsTable user={resolve.user} />
      </ModalBody>
      <ModalFooter>
        <CloseDialogButton />
      </ModalFooter>
    </>
  );
};
