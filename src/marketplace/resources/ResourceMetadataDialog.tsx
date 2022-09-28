import { Modal } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { ResourceSummary } from './ResourceSummary';

export const ResourceMetadataDialog = ({ resolve }) => (
  <>
    <Modal.Header>
      <Modal.Title>{translate('Resource order items')}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <ResourceSummary resource={resolve.resource} />
    </Modal.Body>
  </>
);
