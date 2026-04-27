import { ShieldWarningIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { VersionHistory } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { formatMediumDateTime, formatRelative } from '@/core/dateUtils';
import { StateIndicator } from '@/core/StateIndicator';
import { getAbbreviation } from '@/core/utils';
import { translate } from '@/i18n';

import './VersionHistoryItem.scss';

interface VersionHistoryItemProps {
  version: VersionHistory;
  isSelected: boolean;
  onSelect: () => void;
  versionIndex: number;
  totalVersions: number;
}

const nameToColor = (name: string) => {
  const colors = ['primary', 'success', 'info', 'warning', 'danger'];
  const hash = hashStr(name);
  const index = hash % colors.length;
  return colors[index] || 'primary';
};

const hashStr = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash;
};

const isPolicyComment = (comment: string | undefined): boolean =>
  !!comment?.startsWith('Policy action');

const formatPolicyComment = (comment: string): string => {
  const match = comment.match(
    /^Policy action '(\w+)': (\w+) changed from (\S+) to (\S+)\. Policy: (\w+) [a-f0-9]+\.(?: Scope: ([^.]*)\.)?(?: Created by: [^.]*\.)?(.*)?$/,
  );
  if (!match) return comment;
  const [, , field, oldVal, newVal, policyClass, scope, extra] = match;
  let formatted = `${field}: ${oldVal} → ${newVal} (${scope || policyClass})`;
  if (extra?.trim()) formatted += ` ${extra.trim()}`;
  return formatted;
};

const VersionAvatar: FunctionComponent<{ version: VersionHistory }> = ({
  version,
}) => {
  const userName =
    (version.revision_user as { full_name?: string })?.full_name ||
    (version.revision_user as { username?: string })?.username ||
    'System';
  const color = nameToColor(userName);

  return (
    <div className="timeline-icon symbol symbol-circle symbol-32px me-4">
      <div
        className={`symbol-label fs-5 fw-bold bg-light-${color} text-${color}`}
      >
        {getAbbreviation(userName)}
      </div>
    </div>
  );
};

export const VersionHistoryItem: FunctionComponent<VersionHistoryItemProps> = ({
  version,
  isSelected,
  onSelect,
  versionIndex,
  totalVersions,
}) => {
  const userName =
    (version.revision_user as { full_name?: string })?.full_name ||
    (version.revision_user as { username?: string })?.username ||
    translate('System');

  const versionLabel =
    versionIndex === 0
      ? translate('Current')
      : versionIndex === totalVersions - 1
        ? translate('Initial')
        : `v${totalVersions - versionIndex}`;

  return (
    <div
      className={`version-history-item timeline-item cursor-pointer rounded ${isSelected ? 'bg-light-primary' : ''}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <div className="timeline-line w-30px" />
      <VersionAvatar version={version} />
      <div className="timeline-content py-2 pe-3">
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <div className="fs-7 text-muted">
              <span className="fw-bold fs-6 me-3">{userName}</span>
              {isPolicyComment(version.revision_comment) && (
                <Badge
                  variant="warning"
                  size="sm"
                  leftIcon={<ShieldWarningIcon weight="bold" />}
                  pill
                  outline
                  className="me-2"
                >
                  {translate('Policy')}
                </Badge>
              )}
              <span title={formatMediumDateTime(version.revision_date)}>
                {formatRelative(version.revision_date)}
              </span>
            </div>
            {version.revision_comment && (
              <div className="fs-7 text-muted mt-1">
                {isPolicyComment(version.revision_comment)
                  ? formatPolicyComment(version.revision_comment)
                  : version.revision_comment}
              </div>
            )}
          </div>
          <StateIndicator
            label={versionLabel}
            variant={versionIndex === 0 ? 'success' : 'secondary'}
            outline
            pill
          />
        </div>
      </div>
    </div>
  );
};
