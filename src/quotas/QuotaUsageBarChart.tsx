import { WarningIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { ProgressBar } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { Quota } from '@waldur/openstack/types';
import { formatQuotaName, formatQuotaValue } from '@waldur/quotas/utils';

interface QuotaUsageBarChartProps {
  quotas: Quota[];
  hideLabel?: boolean;
  className?: string;
}

export const exceeds = (quota) => quota.usage + quota.required > quota.limit;

export const getSummary = (quota) =>
  translate('{usage} of {limit} used', {
    usage: formatQuotaValue(quota.usage, quota.name),
    limit: formatQuotaValue(quota.limit, quota.name),
  });

export const getExisting = (quota) =>
  translate('Existing quota usage: {usage}', {
    usage: formatQuotaValue(quota.usage, quota.name),
  });

export const getPlanned = (quota) =>
  translate('Planned quota usage: {usage}', {
    usage: formatQuotaValue(quota.required, quota.name),
  });

export const getAvailable = (quota) => {
  const availableQuota = quota.limit - quota.usage;
  return translate('Available quota usage: {usage}', {
    usage: formatQuotaValue(availableQuota, quota.name),
  });
};

export const ProgressTooltipMessage = ({ quota }) => (
  <div>
    <p className="mt-2">{getPlanned(quota)}</p>
    <p>{getAvailable(quota)}</p>
    <p>{getExisting(quota)}</p>
    {exceeds(quota) && (
      <p className="text-danger">
        {translate('Quota usage exceeds available limit.')}
      </p>
    )}
  </div>
);

export const QuotaUsageBarChartDescription = ({ quota, hideLabel = false }) => (
  <div className="quota-info d-flex justify-content-between gap-4 text-muted mb-2">
    <p className="mb-0">
      {!hideLabel && formatQuotaName(quota.name)}
      {exceeds(quota) && (
        <Tip
          id={quota.name}
          label={translate('Quota usage exceeds available limit.')}
        >
          {' '}
          <WarningIcon
            className="text-warning"
            size={16}
            data-testid="warning"
          />
        </Tip>
      )}
    </p>
    <span>{getSummary(quota)}</span>
  </div>
);

export const QuotaUsageBarChart: FunctionComponent<QuotaUsageBarChartProps> = (
  props,
) => (
  <>
    {props.quotas.map((quota, index) => {
      if (quota.limit !== -1) {
        return (
          <div key={index} className={props.className}>
            <QuotaUsageBarChartDescription
              quota={quota}
              hideLabel={props.hideLabel}
            />

            <Tip
              id="quota-usage"
              label={<ProgressTooltipMessage quota={quota} />}
              className="quota-progress"
            >
              <ProgressBar>
                <ProgressBar
                  variant="primary"
                  now={(quota.usage * 100) / quota.limit}
                  key={1}
                />

                <ProgressBar
                  variant="warning"
                  now={(quota.required * 100) / quota.limit}
                  key={2}
                />
              </ProgressBar>
            </Tip>
          </div>
        );
      }
    })}
  </>
);
