import { Modal } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { ResourceSummaryBase } from '@waldur/resource/summary';

export const ResourceMetadataDialog = ({ resolve }) => (
  <>
    <Modal.Header>
      <Modal.Title>{translate('Resource order items')}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <ResourceSummaryBase resource={resolve.resource} />
    </Modal.Body>
  </>
);
