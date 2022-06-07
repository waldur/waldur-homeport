import React, { useMemo, FunctionComponent } from 'react';
import { Card, Row, Col } from 'react-bootstrap';

import { PlanDetailsButton } from '@waldur/marketplace/details/plan/PlanDetailsButton';
import { OfferingDetailsButton } from '@waldur/marketplace/offerings/details/OfferingDetailsButton';
import { ResourceShowUsageButton } from '@waldur/marketplace/resources/usage/ResourceShowUsageButton';
import { OpenStackInstanceTenantButton } from '@waldur/openstack/openstack-instance/OpenStackInstanceTenantButton';

import { ActionButtonResource } from './actions/ActionButtonResource';
import { ResourceAccessButton } from './ResourceAccessButton';
import { ResourceRefreshButton } from './ResourceRefreshButton';
import { ResourceSummary } from './summary/ResourceSummary';
import { ResourceTabs } from './tabs/ResourceTabs';
import { formatResourceType } from './utils';

let ResourceDetails: FunctionComponent<{ resource; refreshResource }> = ({
  resource,
  refreshResource,
}) => {
  const header = useMemo(() => {
    return formatResourceType(resource);
  }, [resource]);

  if (!resource) {
    return null;
  }

  return (
    <Card>
      <Card.Body>
        <Row className="mb-3">
          <Col lg={12}>
            <div className="pull-right">
              <ResourceAccessButton resource={resource} />
              <ActionButtonResource
                url={resource.url}
                refreshResource={refreshResource}
              />
              <ResourceRefreshButton refreshResource={refreshResource} />
              <OpenStackInstanceTenantButton resource={resource} />
              {resource.marketplace_offering_uuid && (
                <OfferingDetailsButton
                  offering={resource.marketplace_offering_uuid}
                />
              )}
              {resource.is_usage_based && (
                <ResourceShowUsageButton resource={resource} />
              )}
              {resource.marketplace_plan_uuid && (
                <PlanDetailsButton
                  resource={resource.marketplace_resource_uuid}
                />
              )}
            </div>
            <h2>{header}</h2>
          </Col>
        </Row>
        <Row className="mb-3">
          <ResourceSummary resource={resource} />
        </Row>
        <Row className="mb-3">
          <Col lg={12}>
            <ResourceTabs resource={resource} />
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

ResourceDetails = React.memo(ResourceDetails);
export { ResourceDetails };
