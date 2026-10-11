import { OfferingComponent } from 'waldur-js-client';

import { PercentProgress } from '@/core/PercentProgress';
import { getUsagePercentOfLimitComponent } from '@/marketplace/resources/details/QuotaCell';
import { getQuotaCellProps } from '@/marketplace/resources/details/ResourceComponentItem';

interface ResourceQuotaFieldProps {
  row;
  component?: OfferingComponent;
  progressBar?: boolean;
}

export const ResourceQuotaField = ({
  row,
  component,
  progressBar = false,
}: ResourceQuotaFieldProps) => {
  const quotaProps = getQuotaCellProps(component, row);
  const percent = getUsagePercentOfLimitComponent(
    quotaProps.limit,
    quotaProps.usage,
  );
  return progressBar ? (
    <PercentProgress
      value={percent}
      variant={percent > 66 ? 'danger' : percent > 33 ? 'warning' : undefined}
      compact
    />
  ) : (
    <>
      {quotaProps.limit
        ? `${quotaProps.usage.toLocaleString()}/${quotaProps.limit.toLocaleString()}`
        : quotaProps.usage.toLocaleString()}
      {component?.measured_unit && ` ${component.measured_unit}`}
    </>
  );
};
