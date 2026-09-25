import { FC } from 'react';

import { AlertItem, Badge, Card, CardContent } from 'waldur-ui';

import { URGENCY_CONFIG } from '@/changelog/constants';
import { ChangelogEntry } from '@/changelog/types';
import { StateIndicator } from '@/core/StateIndicator';
import { translate } from '@/i18n';
import { ExpandableContainer } from '@/table/ExpandableContainer';

interface ChangelogExpandableRowProps {
  row: ChangelogEntry;
}

export const ChangelogExpandableRow: FC<ChangelogExpandableRowProps> = ({
  row,
}) => (
  <ExpandableContainer>
    {/* Description */}
    <p className="text-muted mb-3">{row.description}</p>

    {/* Security details */}
    {row.security && (
      <AlertItem
        variant={
          row.security.urgency === 'critical' || row.security.urgency === 'high'
            ? 'error'
            : 'warning'
        }
        title={
          <span className="d-flex align-items-center gap-2">
            {translate('Security')}
            <StateIndicator
              variant={
                URGENCY_CONFIG[row.security.urgency]?.variant || 'neutral'
              }
              label={
                URGENCY_CONFIG[row.security.urgency]?.label() ||
                row.security.urgency
              }
              shape="pill"
            />
            {row.security.cve && (
              <Badge variant="neutral" shape="pill" tone="outline">
                {row.security.cve}
              </Badge>
            )}
            {row.security.ghsa && (
              <Badge variant="neutral" shape="pill" tone="outline">
                {row.security.ghsa}
              </Badge>
            )}
          </span>
        }
        body={
          <>
            <div>
              <strong>{translate('Exploitability')}:</strong>{' '}
              {row.security.exploitability}
            </div>
            <div className="mt-1">
              <strong>{translate('Mitigation')}:</strong>{' '}
              {row.security.mitigation}
            </div>
            {row.security.advisory_url && (
              <a
                href={row.security.advisory_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 d-inline-block"
              >
                {translate('View advisory')}
              </a>
            )}
          </>
        }
        className="mb-3"
      />
    )}

    {/* Actions */}
    {row.actions && row.actions.length > 0 && (
      <div className="mb-3">
        <strong className="small">{translate('Post-upgrade actions')}</strong>
        <ul className="mb-0 ps-3 small mt-1">
          {row.actions.map((action, i) => (
            <li key={i} className={action.automatic ? 'text-success' : ''}>
              {action.description}
              {action.automatic && (
                <span className="ms-1 text-muted">
                  ({translate('automatic')})
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    )}

    {/* Impact analysis + Settings + Plugins in a row of cards */}
    {(row.affected_resources_count !== undefined ||
      row.affected_users_count !== undefined ||
      (row.settings_analysis &&
        Object.keys(row.settings_analysis).length > 0) ||
      (row.plugin_analysis && Object.keys(row.plugin_analysis).length > 0)) && (
      <div className="d-flex flex-wrap gap-3 mb-3">
        {/* Affected counts */}
        {(row.affected_resources_count !== undefined ||
          row.affected_users_count !== undefined) && (
          <Card className="flex-fill">
            <CardContent className="py-2 px-3">
              <strong className="small d-block mb-2">
                {translate('Impact analysis')}
              </strong>
              {row.affected_resources_count !== undefined && (
                <div className="d-flex justify-content-between small mb-1">
                  <span className="text-muted">
                    {translate('Affected resources')}
                  </span>
                  <strong>
                    {row.affected_resources_count.toLocaleString()}
                  </strong>
                </div>
              )}
              {row.affected_users_count !== undefined && (
                <div className="d-flex justify-content-between small mb-1">
                  <span className="text-muted">
                    {translate('Affected users')}
                  </span>
                  <strong>{row.affected_users_count.toLocaleString()}</strong>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Settings diffs */}
        {row.settings_analysis &&
          Object.keys(row.settings_analysis).length > 0 && (
            <Card className="flex-fill">
              <CardContent className="py-2 px-3">
                <strong className="small d-block mb-2">
                  {translate('Settings impact')}
                </strong>
                {Object.entries(
                  row.settings_analysis as Record<
                    string,
                    {
                      current_value?: string;
                      default_value?: string;
                      is_customized?: boolean;
                    }
                  >,
                ).map(([key, val]) => (
                  <div key={key} className="small mb-2">
                    <code className="text-primary">{key}</code>
                    {val.is_customized && (
                      <Badge
                        variant="warning"
                        shape="pill"
                        tone="outline"
                        className="ms-2"
                      >
                        {translate('Customized')}
                      </Badge>
                    )}
                    {val.current_value && (
                      <div className="text-muted mt-1">
                        {translate('Current')}: <code>{val.current_value}</code>
                        <br />
                        {translate('Default')}: <code>{val.default_value}</code>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

        {/* Plugin analysis */}
        {row.plugin_analysis && Object.keys(row.plugin_analysis).length > 0 && (
          <Card className="flex-fill">
            <CardContent className="py-2 px-3">
              <strong className="small d-block mb-2">
                {translate('Plugin status')}
              </strong>
              {Object.entries(
                row.plugin_analysis as Record<string, { installed?: boolean }>,
              ).map(([plugin, status]) => (
                <div
                  key={plugin}
                  className="d-flex justify-content-between small mb-1"
                >
                  <code>{plugin}</code>
                  <StateIndicator
                    variant={status.installed ? 'success' : 'neutral'}
                    label={
                      status.installed
                        ? translate('Active')
                        : translate('Not installed')
                    }
                    shape="pill"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    )}

    {/* Relevance reasons + Components */}
    <div className="d-flex align-items-center justify-content-between">
      {row.relevance_reasons && row.relevance_reasons.length > 0 && (
        <div className="small text-muted">
          <strong>{translate('Why relevant')}:</strong>{' '}
          {row.relevance_reasons.join(', ')}
        </div>
      )}
      {row.component && row.component.length > 0 && (
        <div className="d-flex flex-wrap gap-1">
          {row.component.map((c) => (
            <Badge key={c} variant="neutral" shape="pill" tone="outline">
              {c}
            </Badge>
          ))}
        </div>
      )}
    </div>
  </ExpandableContainer>
);
