import { FunctionComponent } from 'react';
import { Col, Accordion, Row } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { ResourceActions } from './actions/ResourceActions';
import { MarketplaceResourceStateField } from './list/MarketplaceResourceStateField';
import { ResourceSummary } from './ResourceSummary';
import { Resource } from './types';

import './ResourceDetailsHeader.scss';

interface ResourceDetailsHeaderProps {
  resource: Resource;
  reInitResource?(): void;
}

export const ResourceDetailsHeader: FunctionComponent<ResourceDetailsHeaderProps> =
  ({ resource, reInitResource }) => (
    <Accordion
      id="resource-details-header"
      className="expandable-panel"
      defaultActiveKey="0"
    >
      <Accordion.Item eventKey="0">
        <Accordion.Header>
          <div className="title-wrap">
            <h4 className="title">
              {resource.name + ' ' + translate('overview')}
            </h4>
            <div className="ms-2">
              <MarketplaceResourceStateField resource={resource} />
            </div>
          </div>
        </Accordion.Header>
        <Accordion.Body>
          <Row className="mb-3">
            <Col sm={12}>
              <ResourceActions
                resource={resource}
                reInitResource={reInitResource}
              />
            </Col>
          </Row>
          <Row>
            <Col sm={12}>
              <ResourceSummary resource={resource} />
            </Col>
          </Row>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
