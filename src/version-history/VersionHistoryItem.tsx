import { FunctionComponent } from 'react';
import { VersionHistory } from 'waldur-js-client';

import { formatMediumDateTime, formatRelative } from '@waldur/core/dateUtils';
import { StateIndicator } from '@waldur/core/StateIndicator';
import { getAbbreviation } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

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
              <span title={formatMediumDateTime(version.revision_date)}>
                {formatRelative(version.revision_date)}
              </span>
            </div>
            {version.revision_comment && (
              <div className="fs-7 text-muted mt-1">
                {version.revision_comment}
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
