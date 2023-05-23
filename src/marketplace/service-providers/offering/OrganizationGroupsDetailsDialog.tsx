import { Modal } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { OrganizationGroup } from '@waldur/marketplace/types';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';

interface OrganizationGroupsDetailsDialogProps {
  resolve: {
    organizationGroups: OrganizationGroup[];
  };
}

export const OrganizationGroupsDetailsDialog = ({
  resolve,
}: OrganizationGroupsDetailsDialogProps) => {
  return (
    <>
      <Modal.Header>
        <Modal.Title>
          {translate('Offering organization groups details')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ul>
          {resolve.organizationGroups.map((item) => (
            <li key={item.uuid}>{item.name}</li>
          ))}
        </ul>
      </Modal.Body>
      <Modal.Footer>
        <CloseDialogButton label={translate('Ok')} />
      </Modal.Footer>
    </>
  );
};
