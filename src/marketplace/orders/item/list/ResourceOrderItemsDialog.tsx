import { Modal } from 'react-bootstrap';

import { ResourceOrderItems } from './ResourceOrderItems';

export const ResourceOrderItemsDialog = ({ resolve }) => (
  <>
    <Modal.Body>
      <ResourceOrderItems
        resource_uuid={
          resolve.resource.marketplace_resource_uuid || resolve.resource.uuid
        }
      />
    </Modal.Body>
  </>
);
