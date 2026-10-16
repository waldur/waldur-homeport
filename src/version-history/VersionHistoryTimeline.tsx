import { FunctionComponent } from 'react';
import { VersionHistory } from 'waldur-js-client';

import { translate } from '@/i18n';

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
      <div
        className="flex justify-center items-center py-10 text-quaternary text-sm"
        role="status"
      >
        <span
          className="spinner-border spinner-border-sm text-brand me-3"
          aria-hidden="true"
        />
        {translate('Loading history...')}
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="text-center text-quaternary py-10 text-sm">
        {translate('No version history available.')}
      </div>
    );
  }

  return (
    <ul
      className="timeline timeline-border-dashed list-unstyled mb-0 px-5 py-5"
      aria-label={translate('Revisions')}
    >
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
    </ul>
  );
};
