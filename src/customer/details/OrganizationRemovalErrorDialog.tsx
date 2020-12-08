import React from 'react';
import {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { getCustomer } from '@waldur/workspace/selectors';

export const OrganizationRemovalErrorDialog = () => {
  const customer = useSelector(getCustomer);
  return (
    <>
      <ModalHeader>
        <ModalTitle>
          {translate('Removing organization {organizationName}', {
            organizationName: customer.name,
          })}
        </ModalTitle>
      </ModalHeader>
      <ModalBody>
        <p>
          {translate('To remove your organization, please send an email to')}{' '}
          <a href={`mailto:${ENV.supportEmail}`}>{ENV.supportEmail}</a>.{' '}
          {translate('Thank you')}!
        </p>
      </ModalBody>
      <ModalFooter>
        <CloseDialogButton />
      </ModalFooter>
    </>
  );
};
