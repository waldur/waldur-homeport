import { Modal } from 'react-bootstrap';

import { ResourceOrders } from './ResourceOrders';

export const ResourceOrdersDialog = ({ resolve }) => (
  <>
    <Modal.Body>
      <ResourceOrders
        resource_uuid={
          resolve.resource.marketplace_resource_uuid || resolve.resource.uuid
        }
      />
    </Modal.Body>
  </>
);
