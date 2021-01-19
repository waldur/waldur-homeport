import { FunctionComponent } from 'react';
import {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { translate, formatJsxTemplate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { getCustomer } from '@waldur/workspace/selectors';

export const OrganizationRemovalErrorDialog: FunctionComponent = () => {
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
        {ENV.supportEmail
          ? translate(
              'To remove your organization, please send an email to {supportEmail}. Thank you!',
              {
                supportEmail: (
                  <a href={`mailto:${ENV.supportEmail}`}>{ENV.supportEmail}</a>
                ),
              },
              formatJsxTemplate,
            )
          : null}
      </ModalBody>
      <ModalFooter>
        <CloseDialogButton />
      </ModalFooter>
    </>
  );
};
