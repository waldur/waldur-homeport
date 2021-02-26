import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { PlanDetailsButton } from '@waldur/marketplace/details/plan/PlanDetailsButton';
import { OfferingDetailsButton } from '@waldur/marketplace/offerings/details/OfferingDetailsButton';
import { ShowReportButton } from '@waldur/marketplace/resources/report/ShowReportButton';
import { Resource } from '@waldur/marketplace/resources/types';
import { isOracleOffering } from '@waldur/support/utils';

import { SupportActionsButton } from './SupportActionsButton';

interface SupportActionsProps {
  resource: Resource;
  reInitResource?(): void;
}

export const SupportActions: FunctionComponent<SupportActionsProps> = ({
  resource,
  reInitResource,
}) => (
  <div className="pull-right">
    <button className="btn btn-default btn-sm" onClick={reInitResource}>
      <i className="fa fa-refresh" /> {translate('Refresh')}
    </button>
    {!isOracleOffering(resource) && Array.isArray(resource.report) && (
      <ShowReportButton report={resource.report} />
    )}
    <SupportActionsButton
      resource={
        {
          ...resource,
          marketplace_resource_uuid: resource.uuid,
        } as any
      }
      reInitResource={reInitResource}
    />
    {resource.offering_uuid && (
      <OfferingDetailsButton offering={resource.offering_uuid} />
    )}
    {resource.plan_uuid && <PlanDetailsButton resource={resource.uuid} />}
  </div>
);
