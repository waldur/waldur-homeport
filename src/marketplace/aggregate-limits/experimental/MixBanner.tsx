import { FC, ReactNode } from 'react';

import { translate } from '@/i18n';

import { MixSummary } from './mixDetection';
import { TraceabilityPopover, TraceabilityRow } from './TraceabilityPopover';

interface MixBannerProps {
  mix: MixSummary;
  groupedBy: string;
  normalization: string;
  // Extra rows shown in the popover next to the chart-specific data sources.
  trace?: TraceabilityRow[];
  // Optional caveat-by-scenario text (overrides the generic mix.description).
  scenarioNote?: ReactNode;
}

const codeColor: Record<MixSummary['code'], string> = {
  A: 'bg-info text-dark',
  B: 'bg-success text-white',
  C: 'bg-warning text-dark',
  D: 'bg-warning text-dark',
  E: 'bg-danger text-white',
};

// Renders a compact strip directly above each chart explaining what the
// chart groups by, what (if anything) it normalises, and which offering-mix
// scenario it detected. Click the info icon to see the precise backend
// endpoint / function / DB field references.
export const MixBanner: FC<MixBannerProps> = ({
  mix,
  groupedBy,
  normalization,
  trace,
  scenarioNote,
}) => {
  const baseTrace: TraceabilityRow[] = [
    {
      label: translate('Detected mix'),
      value: `${mix.code} — ${mix.label}. ${mix.description}`,
    },
    {
      label: translate('Distinct billing types'),
      value: mix.billingTypes.length
        ? mix.billingTypes.join(', ')
        : translate('(none)'),
    },
    {
      label: translate('Distinct limit periods'),
      value: mix.limitPeriods.length
        ? mix.limitPeriods.join(', ')
        : translate('(none — usage-only)'),
    },
    {
      label: translate('Component count by billing'),
      value: `usage=${mix.usageComponentCount}, limit=${mix.limitComponentCount}, offerings=${mix.offeringCount}`,
    },
    {
      label: translate('Source for mix detection'),
      value:
        'src/marketplace/aggregate-limits/experimental/mixDetection.ts (detectMix). Operates on ComponentsUsageStatsPerOffering rows returned by the components-usage endpoint.',
    },
  ];
  return (
    <div className="d-flex flex-wrap align-items-center gap-2 small mb-2 px-2 py-2 rounded bg-body-secondary">
      <span className={`badge ${codeColor[mix.code]}`}>{mix.label}</span>
      <span>
        <strong className="text-secondary">{translate('Grouped by')}:</strong>{' '}
        {groupedBy}
      </span>
      <span>
        <strong className="text-secondary">
          {translate('Normalization')}:
        </strong>{' '}
        {normalization}
      </span>
      {scenarioNote && <span className="text-muted">· {scenarioNote}</span>}
      <TraceabilityPopover
        id={`mix-banner-${mix.code}-${groupedBy.replace(/\W+/g, '-').slice(0, 20)}`}
        title={translate('Grouping & data sources')}
        rows={[...baseTrace, ...(trace ?? [])]}
      />
    </div>
  );
};
