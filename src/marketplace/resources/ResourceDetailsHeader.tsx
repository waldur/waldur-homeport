import { FunctionComponent, useState } from 'react';
import { Col, Panel, Row } from 'react-bootstrap';

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
  ({ resource, reInitResource }) => {
    const [headerToggle, setHeaderToggle] = useState<boolean>(true);
    return (
      <Panel
        id="resource-details-header"
        className="expandable-panel"
        expanded={headerToggle}
        onToggle={(toggle) => setHeaderToggle(toggle)}
      >
        <Panel.Heading>
          <Panel.Toggle componentClass="div" className="toggle">
            <div className="title-wrap">
              <h4 className="title">
                {resource.name + ' ' + translate('overview')}
              </h4>
              <div className="m-l-sm">
                <MarketplaceResourceStateField resource={resource} />
              </div>
            </div>
            {headerToggle ? (
              <i className="icon fa fa-chevron-up fixed-width-icon"></i>
            ) : (
              <i className="icon fa fa-chevron-down fixed-width-icon"></i>
            )}
          </Panel.Toggle>
        </Panel.Heading>
        <Panel.Collapse>
          <Panel.Body>
            <Row className="m-b-md">
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
          </Panel.Body>
        </Panel.Collapse>
      </Panel>
    );
  };
