import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { BookingActions } from '@waldur/booking/BookingActions';
import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { translate } from '@waldur/i18n';
import { PlanDetailsButton } from '@waldur/marketplace/details/plan/PlanDetailsButton';
import { OfferingDetailsButton } from '@waldur/marketplace/offerings/details/OfferingDetailsButton';
import { ShowReportButton } from '@waldur/marketplace/resources/report/ShowReportButton';
import { Resource } from '@waldur/marketplace/resources/types';
import { ResourceShowUsageButton } from '@waldur/marketplace/resources/usage/ResourceShowUsageButton';
import { ResourceAccessButton } from '@waldur/resource/ResourceAccessButton';

import { ResourceActionsButton } from './ResourceActionsButton';

interface ResourceActionsProps {
  resource: Resource;
  reInitResource?(): void;
}

export const ResourceActions: FunctionComponent<ResourceActionsProps> = ({
  resource,
  reInitResource,
}) => (
  <div className="pull-right btn-group">
    <ResourceAccessButton resource={resource} />
    <Button size="sm" onClick={reInitResource}>
      <i className="fa fa-refresh" /> {translate('Refresh')}
    </Button>
    {Array.isArray(resource.report) && (
      <ShowReportButton report={resource.report} />
    )}
    {resource.offering_type === OFFERING_TYPE_BOOKING ? (
      <BookingActions resource={resource} reInitResource={reInitResource} />
    ) : (
      <ResourceActionsButton
        resource={
          {
            ...resource,
            marketplace_resource_uuid: resource.uuid,
          } as any
        }
        reInitResource={reInitResource}
      />
    )}
    <OfferingDetailsButton offering={resource.offering_uuid} />
    {resource.is_usage_based && <ResourceShowUsageButton resource={resource} />}
    {resource.plan_uuid && <PlanDetailsButton resource={resource.uuid} />}
  </div>
);
