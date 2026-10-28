import { FunctionComponent } from 'react';
import { VersionHistory } from 'waldur-js-client';

import { LoadingSpinner, Timeline } from 'waldur-ui';

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
        className="flex justify-center items-center py-8 text-quaternary text-sm"
        role="status"
      >
        <LoadingSpinner
          size={16}
          className="text-brand me-2.5"
          aria-hidden="true"
        />
        {translate('Loading history...')}
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="text-center text-quaternary py-8 text-sm">
        {translate('No version history available.')}
      </div>
    );
  }

  return (
    <Timeline className="mb-0 px-4 py-4" aria-label={translate('Revisions')}>
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
    </Timeline>
  );
};
