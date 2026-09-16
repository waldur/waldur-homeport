import { FunctionComponent } from 'react';
import { Issue } from 'waldur-js-client';

import { Badge } from 'waldur-ui';

import { translate } from '@/i18n';

/** Resolve the effective SLA state, treating sla_breached as authoritative. */
const getSlaState = (issue: Pick<Issue, 'sla_status' | 'sla_breached'>) =>
  issue.sla_breached ? 'breached' : issue.sla_status;

/** Plain-text SLA label for table exports; empty string when not applicable. */
export const getSlaLabel = (
  issue: Pick<Issue, 'sla_status' | 'sla_breached'>,
): string => {
  switch (getSlaState(issue)) {
    case 'breached':
      return translate('SLA breached');
    case 'on_track':
      return translate('On track');
    case 'met':
      return translate('SLA met');
    default:
      return '';
  }
};

/**
 * SLA status badge shown independently of provider routing, so operators see
 * breaches on unrouted tickets too. Renders null when there is no SLA state.
 */
export const IssueSlaBadge: FunctionComponent<{
  issue: Pick<Issue, 'sla_status' | 'sla_breached'>;
}> = ({ issue }) => {
  switch (getSlaState(issue)) {
    case 'breached':
      return (
        <Badge variant="danger" shape="pill" tone="outline">
          {translate('SLA breached')}
        </Badge>
      );
    case 'on_track':
      return (
        <Badge variant="success" shape="pill" tone="outline">
          {translate('On track')}
        </Badge>
      );
    case 'met':
      return (
        <Badge variant="secondary" shape="pill" tone="outline">
          {translate('SLA met')}
        </Badge>
      );
    default:
      return null;
  }
};
