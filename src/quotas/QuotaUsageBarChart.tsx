import * as React from 'react';
import * as ProgressBar from 'react-bootstrap/lib/ProgressBar';

import { Tooltip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { Quota } from '@waldur/openstack/types';
import { formatQuotaName, formatQuotaValue } from '@waldur/quotas/utils';

interface QuotaUsageBarChartProps {
  quotas: Quota[];
}

export const exceeds = quota => quota.usage + quota.required > quota.limit;

export const getSummary = quota =>
  translate('{usage} of {limit} used', {
    usage: formatQuotaValue(quota.usage, quota.name),
    limit: formatQuotaValue(quota.limit, quota.name),
  });

export const getExisting = quota =>
  translate('Existing quota usage: {usage}', {
    usage: formatQuotaValue(quota.usage, quota.name),
  });

export const getPlanned = quota =>
  translate('Planned quota usage: {usage}', {
    usage: formatQuotaValue(quota.required, quota.name),
  });

export const getAvailable = quota => {
  const availableQuota = quota.limit - quota.usage;
  return translate('Available quota usage: {usage}', {
    usage: formatQuotaValue(availableQuota, quota.name),
  });
};

export const ProgressTooltipMessage = ({ quota }) => (
  <div>
    <p className="m-t-sm">{getPlanned(quota)}</p>
    <p>{getAvailable(quota)}</p>
    <p>{getExisting(quota)}</p>
    {exceeds(quota) && (
      <p className="text-danger">
        {translate('Quota usage exceeds available limit.')}
      </p>
    )}
  </div>
);

export const QuotaUsageBarChartDescription = ({ quota }) => (
  <>
    <span>
      <strong>{formatQuotaName(quota.name)}</strong>
      {exceeds(quota) && (
        <Tooltip
          id={quota.name}
          label={translate('Quota usage exceeds available limit.')}
        >
          {' '}
          <i className="fa fa-exclamation-triangle" />
        </Tooltip>
      )}
    </span>
    <span className="pull-right text-muted">{getSummary(quota)}</span>
  </>
);

export const QuotaUsageBarChart = (props: QuotaUsageBarChartProps) => (
  <>
    {props.quotas.map((quota, index) => {
      if (quota.limit !== -1) {
        return (
          <React.Fragment key={index}>
            <div className="m-b-sm clearfix">
              <QuotaUsageBarChartDescription quota={quota} />
            </div>
            <Tooltip
              id="quota-usage"
              label={<ProgressTooltipMessage quota={quota} />}
            >
              <ProgressBar>
                <ProgressBar
                  bsStyle="success"
                  now={(quota.usage * 100) / quota.limit}
                  key={1}
                />
                <ProgressBar
                  bsStyle="warning"
                  now={(quota.required * 100) / quota.limit}
                  key={2}
                />
              </ProgressBar>
            </Tooltip>
          </React.Fragment>
        );
      }
    })}
  </>
);
