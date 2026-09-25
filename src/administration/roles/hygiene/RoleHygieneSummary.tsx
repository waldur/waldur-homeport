import { RoleHygieneReport } from 'waldur-js-client';

import { Badge } from 'waldur-ui';

import { SummaryWidget } from '@/core/SummaryWidget';
import { translate } from '@/i18n';

export const RoleHygieneSummary = ({
  report,
}: {
  report: RoleHygieneReport;
}) => (
  <SummaryWidget
    // Cancels the row's negative *horizontal* gutter margins, which would
    // otherwise bleed past the tab pane and get clipped by its overflow. The
    // vertical one stays: it cancels the 13px gutter each column carries as
    // `margin-top`, so the only gap above the cards is the pane's own 16px of
    // padding.
    className="mx-0 role-hygiene-summary"
    // The findings table's tab strip below brings its own top padding; the
    // widget's own bottom margin would sit on top of it.
    spaceless
    stats={[
      {
        label: translate('Roles checked'),
        value: (
          <div className="d-flex align-items-baseline justify-content-between">
            <span>{report.roles_checked.toLocaleString()}</span>
            <Badge variant="neutral" shape="pill" tone="outline">
              {translate('{count} with findings', {
                count: report.roles_with_findings,
              })}
            </Badge>
          </div>
        ),
      },
      {
        label: translate('Errors'),
        value: report.error_count.toLocaleString(),
      },
      {
        label: translate('Warnings'),
        value: report.warning_count.toLocaleString(),
      },
      {
        label: translate('Info'),
        value: report.info_count.toLocaleString(),
      },
    ]}
  />
);
