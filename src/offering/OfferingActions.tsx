import * as React from 'react';

import { translate } from '@waldur/i18n';
import { PlanDetailsButton } from '@waldur/marketplace/details/plan/PlanDetailsButton';
import { OfferingDetailsButton } from '@waldur/marketplace/offerings/details/OfferingDetailsButton';
import { ResourceShowUsageButton } from '@waldur/marketplace/resources/usage/ResourceShowUsageButton';
import { isOracleOffering } from '@waldur/offering/utils';
import { ActionButtonResource } from '@waldur/resource/actions/ActionButtonResource';

import { OfferingReportButton } from './OfferingReportButton';

export const OfferingActions = ({ offering, reInitResource }) => (
  <div className="pull-right">
    <button className="btn btn-default btn-sm" onClick={reInitResource}>
      <i className="fa fa-refresh" /> {translate('Refresh')}
    </button>
    {!isOracleOffering(offering) && Boolean(offering.report) && (
      <OfferingReportButton offering={offering} />
    )}
    <ActionButtonResource url={offering.url} />
    {offering.marketplace_offering_uuid && (
      <OfferingDetailsButton offering={offering.marketplace_offering_uuid} />
    )}
    {offering.is_usage_based && (
      <ResourceShowUsageButton resource={offering.marketplace_resource_uuid} />
    )}
    {offering.marketplace_plan_uuid && (
      <PlanDetailsButton resource={offering.marketplace_resource_uuid} />
    )}
  </div>
);
