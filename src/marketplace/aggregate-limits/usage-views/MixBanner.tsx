import { FC, ReactNode } from 'react';

import { Badge } from '@/core/Badge';
import { translate } from '@/i18n';

import { MixSummary } from './mixDetection';

interface MixBannerProps {
  mix: MixSummary;
  groupedBy: string;
  normalization: string;
  // Optional caveat-by-scenario text (overrides the generic mix.description).
  scenarioNote?: ReactNode;
}

// Theme badge variants rather than raw bg-* classes, so the strip follows
// light and dark mode like every other badge in the portal.
const codeVariant: Record<MixSummary['code'], string> = {
  A: 'info',
  B: 'success',
  C: 'warning',
  D: 'warning',
  E: 'danger',
};

// Renders a compact strip directly above each chart explaining what the
// chart groups by, what (if anything) it normalises, and which offering-mix
// scenario it detected — aggregating across offerings that measure different
// things is exactly where a chart can mislead.
export const MixBanner: FC<MixBannerProps> = ({
  mix,
  groupedBy,
  normalization,
  scenarioNote,
}) => {
  return (
    <div className="d-flex flex-wrap align-items-center gap-2 small mb-2 px-2 py-2 rounded bg-body-secondary">
      <Badge variant={codeVariant[mix.code]} light>
        {mix.label}
      </Badge>
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
    </div>
  );
};
