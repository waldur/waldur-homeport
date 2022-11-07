import { Modal } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { ResourceSummaryBase } from '@waldur/resource/summary';
import * as ResourceSummaryRegistry from '@waldur/resource/summary/registry';

import { ResourceSummary } from './ResourceSummary';

export const ResourceMetadataDialog = ({ resolve }) => {
  const SummaryComponent =
    ResourceSummaryRegistry.get(resolve.resource.resource_type) ||
    ResourceSummaryBase;

  return (
    <>
      <Modal.Header>
        <Modal.Title>{translate('Resource metadata')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ResourceSummary resource={resolve.resource}>
          <SummaryComponent resource={resolve.scope} />
        </ResourceSummary>
      </Modal.Body>
    </>
  );
};
