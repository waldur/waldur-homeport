import { FunctionComponent, useMemo, useState } from 'react';
import { VersionHistory } from 'waldur-js-client';

import { StateIndicator } from '@/core/StateIndicator';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

import { useVersionHistory } from './api';
import { VersionHistoryDialogProps } from './types';
import { VersionDiffViewer } from './VersionDiffViewer';
import { VersionHistoryTimeline } from './VersionHistoryTimeline';
import { VersionStateAtTimestamp } from './VersionStateAtTimestamp';

// Support both direct props and resolve pattern (for DialogActionItem)
interface ResolveProps {
  resolve?: VersionHistoryDialogProps;
}

export const VersionHistoryDialog: FunctionComponent<
  VersionHistoryDialogProps | ResolveProps
> = (props) => {
  // Support both direct props and resolve pattern
  const { entityType, entityUuid, entityName } =
    'resolve' in props && props.resolve
      ? props.resolve
      : (props as VersionHistoryDialogProps);
  const { data: versions = [], isLoading } = useVersionHistory(
    entityType,
    entityUuid,
  );
  const [selectedVersion, setSelectedVersion] = useState<VersionHistory | null>(
    null,
  );
  const [timestampVersion, setTimestampVersion] =
    useState<VersionHistory | null>(null);

  // Auto-select the first (current) version when data loads
  const effectiveSelectedVersion = useMemo(() => {
    if (timestampVersion) return timestampVersion;
    if (selectedVersion) return selectedVersion;
    if (versions.length > 0) return versions[0];
    return null;
  }, [versions, selectedVersion, timestampVersion]);

  // Find the previous version for diff comparison
  const previousVersion = useMemo(() => {
    if (!effectiveSelectedVersion) return null;
    if (timestampVersion) {
      // For timestamp queries, find the closest version before or at the timestamp
      const idx = versions.findIndex((v) => v.id === timestampVersion.id);
      if (idx >= 0 && idx < versions.length - 1) {
        return versions[idx + 1];
      }
      return null;
    }
    const idx = versions.findIndex((v) => v.id === effectiveSelectedVersion.id);
    if (idx >= 0 && idx < versions.length - 1) {
      return versions[idx + 1];
    }
    return null;
  }, [versions, effectiveSelectedVersion, timestampVersion]);

  const handleSelectVersion = (version: VersionHistory) => {
    setSelectedVersion(version);
    setTimestampVersion(null);
  };

  const handleTimestampVersionLoaded = (version: VersionHistory) => {
    setTimestampVersion(version);
    setSelectedVersion(null);
  };

  return (
    <ModalDialog
      title={translate('Version history: {name}', { name: entityName })}
      footer={<CloseDialogButton label={translate('Close')} />}
      bodyClassName="p-0"
    >
      <div className="d-flex flex-column" style={{ height: '70vh' }}>
        {/* Toolbar */}
        <div className="d-flex justify-content-between align-items-center px-5 py-4 border-bottom">
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted fs-7">{translate('Total')}:</span>
            <StateIndicator
              label={`${versions.length} ${translate('versions')}`}
              variant="info"
              outline
            />
          </div>
          <VersionStateAtTimestamp
            entityType={entityType}
            entityUuid={entityUuid}
            onVersionLoaded={handleTimestampVersionLoaded}
          />
        </div>

        {/* Main content */}
        <div className="d-flex flex-grow-1 overflow-hidden">
          {/* Timeline panel */}
          <div
            className="border-end overflow-auto"
            style={{ width: '380px', minWidth: '320px' }}
          >
            <div className="fw-bold fs-6 px-5 py-4 border-bottom">
              {translate('Revisions')}
            </div>
            <VersionHistoryTimeline
              versions={versions}
              selectedVersionId={effectiveSelectedVersion?.id || null}
              onSelectVersion={handleSelectVersion}
              isLoading={isLoading}
            />
          </div>

          {/* Diff panel */}
          <div className="flex-grow-1 overflow-hidden d-flex flex-column">
            <VersionDiffViewer
              entityType={entityType}
              currentVersion={effectiveSelectedVersion}
              previousVersion={previousVersion}
            />
          </div>
        </div>
      </div>
    </ModalDialog>
  );
};
