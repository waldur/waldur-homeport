import { RoleHygieneReport } from 'waldur-js-client';

import { SummaryWidget } from '@/core/SummaryWidget';
import { translate } from '@/i18n';

export const RoleHygieneSummary = ({
  report,
}: {
  report: RoleHygieneReport;
}) => (
  <SummaryWidget
    stats={[
      {
        label: translate('Roles checked'),
        value: (
          <div className="d-flex align-items-baseline justify-content-between">
            <span>{report.roles_checked.toLocaleString()}</span>
            <span className="fs-7 fw-normal text-muted">
              {translate('{count} with findings', {
                count: report.roles_with_findings,
              })}
            </span>
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
