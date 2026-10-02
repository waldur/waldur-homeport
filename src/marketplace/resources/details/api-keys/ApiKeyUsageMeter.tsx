import { FC } from 'react';

import { formatUsageValue } from '@/core/formatNumber';
import { ProgressBar } from '@/core/ProgressBar';
import { translate } from '@/i18n';
import { DASH_ESCAPE_CODE } from '@/table/constants';

import { ComponentUsage, componentLabel, getMeterVariant } from './keyLimits';

export const UsageMeter: FC<{ reading: ComponentUsage }> = ({ reading }) => {
  const { used, limit, component } = reading;
  // A limited component always reads against its limit, as the Quotas panel does;
  // nothing reported is 0, not a blank.
  const notes =
    limit === undefined
      ? []
      : [
          reading.inherited && translate('inherited'),
          reading.overLimit && translate('over limit'),
        ].filter(Boolean);
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-x-4">
        <span>{componentLabel(component)}</span>
        <span>
          {limit === undefined
            ? used !== undefined
              ? formatUsageValue(used)
              : DASH_ESCAPE_CODE
            : translate('{used} of {limit}', {
                used: formatUsageValue(used ?? 0),
                limit: formatUsageValue(limit),
              })}
          {(limit !== undefined || used !== undefined) &&
          component.measured_unit
            ? ` ${component.measured_unit}`
            : ''}
          {notes.length > 0 && ` (${notes.join(', ')})`}
        </span>
      </div>
      {limit !== undefined && (
        <ProgressBar
          now={used ?? 0}
          max={limit}
          variant={getMeterVariant(reading.ratio)}
          neutralTrack
        />
      )}
    </div>
  );
};

export const ApiKeyUsageSummary: FC<{ reading?: ComponentUsage }> = ({
  reading,
}) =>
  reading ? (
    <div className="min-w-[200px]">
      <div className="flex items-center justify-between gap-x-4">
        <span>{componentLabel(reading.component)}</span>
        <span className="whitespace-nowrap">
          {Math.round(reading.ratio ?? 0)}%
        </span>
      </div>
      <ProgressBar
        now={reading.used ?? 0}
        max={reading.limit}
        variant={getMeterVariant(reading.ratio)}
        neutralTrack
      />
    </div>
  ) : (
    <>{DASH_ESCAPE_CODE}</>
  );
