import { Modal } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { ResourceOrderItems } from './ResourceOrderItems';

export const ResourceOrderItemsDialog = ({ resolve }) => (
  <>
    <Modal.Header>
      <Modal.Title>{translate('Resource order items')}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <ResourceOrderItems
        resource_uuid={
          resolve.resource.marketplace_resource_uuid || resolve.resource.uuid
        }
      />
    </Modal.Body>
  </>
);
