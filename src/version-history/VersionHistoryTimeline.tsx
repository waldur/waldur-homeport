import { FunctionComponent } from 'react';
import { VersionHistory } from 'waldur-js-client';

import { translate } from '@waldur/i18n';

import { VersionHistoryItem } from './VersionHistoryItem';

interface VersionHistoryTimelineProps {
  versions: VersionHistory[];
  selectedVersionId: number | null;
  onSelectVersion: (version: VersionHistory) => void;
  isLoading: boolean;
}

export const VersionHistoryTimeline: FunctionComponent<
  VersionHistoryTimelineProps
> = ({ versions, selectedVersionId, onSelectVersion, isLoading }) => {
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-10 text-muted fs-6">
        <span className="spinner-border spinner-border-sm text-primary me-3" />
        {translate('Loading history...')}
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="text-center text-muted py-10 fs-6">
        {translate('No version history available.')}
      </div>
    );
  }

  return (
    <div className="timeline timeline-border-dashed px-5 py-5">
      {versions.map((version, index) => (
        <VersionHistoryItem
          key={version.id}
          version={version}
          isSelected={version.id === selectedVersionId}
          onSelect={() => onSelectVersion(version)}
          versionIndex={index}
          totalVersions={versions.length}
        />
      ))}
    </div>
  );
};
