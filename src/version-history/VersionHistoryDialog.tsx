import { ArrowLeftIcon } from '@phosphor-icons/react';
import { FunctionComponent, useEffect, useMemo, useRef, useState } from 'react';
import { VersionHistory } from 'waldur-js-client';

import { BaseButton, useBreakpointUp } from 'waldur-ui';

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
  // Below md there is no room for the list and the diff side by side, so a
  // phone shows one at a time: the list, then the picked revision's diff.
  const isWide = useBreakpointUp('md');
  const [mobilePane, setMobilePane] = useState<'list' | 'diff'>('list');
  const showList = isWide || mobilePane === 'list';
  const showDiff = isWide || mobilePane === 'diff';
  const listRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const paneChanged = useRef(false);

  // Switching panes unmounts the focused control, so move focus to where the
  // user lands: the back button, or the revision they came back from.
  useEffect(() => {
    if (isWide || !paneChanged.current) return;
    if (mobilePane === 'diff') {
      backRef.current?.focus();
    } else {
      listRef.current
        ?.querySelector<HTMLButtonElement>('[aria-current="true"]')
        ?.focus();
    }
  }, [mobilePane, isWide]);

  const showPane = (pane: 'list' | 'diff') => {
    paneChanged.current = true;
    setMobilePane(pane);
  };

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
    showPane('diff');
  };

  const handleTimestampVersionLoaded = (version: VersionHistory) => {
    setTimestampVersion(version);
    setSelectedVersion(null);
    showPane('diff');
  };

  return (
    <ModalDialog
      title={translate('Version history: {name}', { name: entityName })}
      footer={<CloseDialogButton label={translate('Close')} />}
      bodyClassName="p-0"
    >
      <div className="flex flex-col" style={{ height: '70vh' }}>
        {/* Toolbar: wraps onto two rows on a phone. */}
        <div className="flex flex-wrap justify-between items-center gap-2.5 px-4 py-3 border-b-[1px] border-b-secondary">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-quaternary text-xs">
              {translate('Total')}:
            </span>
            <StateIndicator
              label={`${versions.length} ${translate('versions')}`}
              variant="info"
              tone="outline"
            />
          </div>
          <VersionStateAtTimestamp
            entityType={entityType}
            entityUuid={entityUuid}
            onVersionLoaded={handleTimestampVersionLoaded}
          />
        </div>

        {/* Main content */}
        <div className="flex grow overflow-hidden">
          {showList && (
            <div
              ref={listRef}
              className={
                isWide
                  ? 'border-r-[1px] border-r-secondary overflow-auto w-[380px] min-w-[320px] shrink-0'
                  : 'overflow-auto w-full'
              }
            >
              <div className="font-medium text-sm px-4 py-3 border-b-[1px] border-b-secondary">
                {translate('Revisions')}
              </div>
              <VersionHistoryTimeline
                versions={versions}
                selectedVersionId={effectiveSelectedVersion?.id || null}
                onSelectVersion={handleSelectVersion}
                isLoading={isLoading}
              />
            </div>
          )}

          {showDiff && (
            <div className="grow overflow-hidden flex flex-col min-w-0">
              {!isWide && (
                <div className="px-2.5 py-1.5 border-b-[1px] border-b-secondary">
                  <BaseButton
                    ref={backRef}
                    variant="text-secondary"
                    size="sm"
                    iconNode={<ArrowLeftIcon weight="bold" />}
                    label={translate('Revisions')}
                    onClick={() => showPane('list')}
                  />
                </div>
              )}
              <VersionDiffViewer
                entityType={entityType}
                currentVersion={effectiveSelectedVersion}
                previousVersion={previousVersion}
              />
            </div>
          )}
        </div>
      </div>
    </ModalDialog>
  );
};
