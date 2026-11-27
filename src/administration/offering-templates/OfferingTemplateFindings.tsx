import { FC } from 'react';
import {
  OfferingConfigurationFinding,
  OfferingTemplate,
} from 'waldur-js-client';

import { Badge, Code } from 'waldur-ui';

import { translate } from '@/i18n';
import { SimpleTable } from '@/table/SimpleTable';

const findingsOf = (
  template: OfferingTemplate,
): OfferingConfigurationFinding[] => template.configuration_findings ?? [];

const countBySeverity = (template: OfferingTemplate) => {
  const findings = findingsOf(template);
  return {
    errors: findings.filter((finding) => finding.severity === 'error').length,
    warnings: findings.filter((finding) => finding.severity === 'warning')
      .length,
  };
};

/** Shown next to a template's name: what the site-agent consistency rules
 * find in it. An error refuses every offering created from it. */
export const OfferingTemplateFindingsBadges: FC<{ row: OfferingTemplate }> = ({
  row,
}) => {
  const { errors, warnings } = countBySeverity(row);
  return errors || warnings ? (
    <span
      className="inline-flex gap-1 flex-wrap"
      data-testid="offering-template-findings"
    >
      {errors ? (
        <Badge variant="danger" size="sm">
          {errors === 1
            ? translate('1 error')
            : translate('{count} errors', { count: errors })}
        </Badge>
      ) : null}
      {warnings ? (
        <Badge variant="warning" size="sm">
          {warnings === 1
            ? translate('1 warning')
            : translate('{count} warnings', { count: warnings })}
        </Badge>
      ) : null}
    </span>
  ) : null;
};

/** Findings of the site-agent consistency rules, one per row, errors
 * first as the API sends them: a template's, a dry run's or an offering's. */
export const ConfigurationFindingsTable: FC<{
  findings: OfferingConfigurationFinding[];
}> = ({ findings }) => (
  <SimpleTable<OfferingConfigurationFinding & { index: number }>
    rowKey="index"
    rows={findings.map((finding, index) => ({ ...finding, index }))}
    columns={[
      {
        title: translate('Severity'),
        rowHeader: true,
        render: ({ row: finding }) => (
          <Badge
            variant={finding.severity === 'error' ? 'danger' : 'warning'}
            size="sm"
          >
            {finding.severity === 'error'
              ? translate('Error')
              : translate('Warning')}
          </Badge>
        ),
      },
      {
        title: translate('Field'),
        render: ({ row: finding }) => (
          <Code className="text-xs break-words">{finding.field}</Code>
        ),
      },
      {
        title: translate('Finding'),
        className: 'whitespace-normal',
        render: ({ row: finding }) => finding.message,
      },
    ]}
  />
);

export const OfferingTemplateFindingsTable: FC<{ row: OfferingTemplate }> = ({
  row,
}) => <ConfigurationFindingsTable findings={findingsOf(row)} />;
