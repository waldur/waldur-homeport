import classNames from 'classnames';
import { FC, useMemo, useState } from 'react';

import { MediumIconButton } from '@/core/buttons/IconButton';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SidebarToggleGraphic } from '@/core/SidebarToggleGraphic';
import { FilterBox } from '@/form/FilterBox';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';

import { RoomCallState } from './call/useAllRoomCallStates';
import { MatrixRoomListItem } from './MatrixRoomListItem';
import { MatrixRoomRailItem } from './MatrixRoomRailItem';
import { PreviewKind } from './previewClassifier';
import { buildRoomSections, ChatRoomSummary, RoomFilter } from './roomSections';

interface EnrichedRoom {
  uuid: string;
  room_name?: string;
  scope_name?: string;
  state?: string;
  room_alias?: string;
  unreadCount: number;
  mentionCount: number;
  isMuted: boolean;
  preview: string;
  previewKind: PreviewKind;
  previewFileName?: string;
  previewFileSize?: number;
  previewSender: string;
  lastActivity: number;
  members_count?: number;
  activeCall: RoomCallState | null;
}

interface MatrixRoomListProps {
  rooms: EnrichedRoom[];
  isLoading: boolean;
  onSelect: (uuid: string) => void;
  activeRoomUuid?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const MatrixRoomList: FC<MatrixRoomListProps> = ({
  rooms,
  isLoading,
  onSelect,
  activeRoomUuid,
  collapsed,
  onToggleCollapse,
}) => {
  const [filter, setFilter] = useState<RoomFilter>('all');
  const [search, setSearch] = useState('');

  const activeRooms = useMemo(
    () => rooms.filter((r) => r.state === 'active'),
    [rooms],
  );

  const byUuid = useMemo(
    () => new Map(activeRooms.map((r) => [r.uuid, r])),
    [activeRooms],
  );

  const summaries: ChatRoomSummary[] = useMemo(
    () =>
      activeRooms.map((r) => ({
        uuid: r.uuid,
        name: r.room_name || r.room_alias || r.uuid,
        scopeName: r.scope_name,
        unreadCount: r.unreadCount,
        mentionCount: r.mentionCount,
        lastActivity: r.lastActivity,
      })),
    [activeRooms],
  );

  // Flat, unread-first then most-recent order. The design shows a single list
  // with no section headers, so the section grouping is collapsed here while
  // `buildRoomSections` keeps the unread-before-recent ordering intact.
  const visibleRooms = useMemo(
    () => buildRoomSections(summaries, filter, search).flatMap((s) => s.rooms),
    [summaries, filter, search],
  );

  // Same ordering as the expanded list (default filter, no search) so
  // collapse/expand never reshuffles the rail.
  const orderedRooms = useMemo(
    () => buildRoomSections(summaries, 'all', '').flatMap((s) => s.rooms),
    [summaries],
  );

  if (collapsed) {
    return (
      <div className="team-chat tc-sidebar tc-sidebar--collapsed">
        {/* The collapse control is hidden in the design, but a persisted
            collapsed state still needs an escape back to the full list. */}
        {onToggleCollapse && (
          <div className="tc-sidebar-top">
            <MediumIconButton
              iconNode={
                <span className="aui-icon-rotate-180">
                  <SidebarToggleGraphic />
                </span>
              }
              tooltip={translate('Expand sidebar')}
              onClick={onToggleCollapse}
              variant="tertiary-ghost"
            />
          </div>
        )}
        <div className="tc-rail">
          {orderedRooms.map((room) => (
            <MatrixRoomRailItem
              key={room.uuid}
              uuid={room.uuid}
              name={room.name}
              unreadCount={room.unreadCount}
              mentionCount={room.mentionCount}
              activeCall={byUuid.get(room.uuid)?.activeCall ?? null}
              active={room.uuid === activeRoomUuid}
              onClick={() => onSelect(room.uuid)}
            />
          ))}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="team-chat tc-sidebar">
        <div className="tc-placeholder">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const hasRooms = activeRooms.length > 0;
  const isEmpty = visibleRooms.length === 0;
  const isFiltered = filter !== 'all' || search.trim().length > 0;

  const segment = (key: RoomFilter, label: string) => (
    <button
      type="button"
      className={classNames('tc-segment-item', { active: filter === key })}
      onClick={() => setFilter(key)}
    >
      {label}
    </button>
  );

  return (
    <div className="team-chat tc-sidebar">
      <div className="tc-sidebar-top">
        <FilterBox
          type="search"
          placeholder={translate('Search...')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="tc-segment" role="tablist">
          {segment('all', translate('All'))}
          {segment('unread', translate('Unread'))}
          {segment('mentions', translate('Mentions'))}
        </div>
      </div>

      {isEmpty ? (
        <div className="tc-placeholder">
          {!hasRooms ? (
            <NoResult
              title={translate('No conversations yet')}
              message={translate(
                'Team chat rooms are created automatically for your projects.',
              )}
              noAction
            />
          ) : isFiltered ? (
            <NoResult
              title={translate('No conversations match your filters')}
              callback={() => {
                setSearch('');
                setFilter('all');
              }}
              buttonTitle={translate('Clear filters')}
            />
          ) : (
            <NoResult title={translate('No conversations')} noAction />
          )}
        </div>
      ) : (
        <div className="tc-list">
          {visibleRooms.map((summary) => {
            const room = byUuid.get(summary.uuid);
            if (!room) return null;
            return (
              <MatrixRoomListItem
                key={summary.uuid}
                uuid={summary.uuid}
                name={summary.name}
                scopeName={room.scope_name}
                preview={room.preview}
                previewKind={room.previewKind}
                previewFileName={room.previewFileName}
                previewFileSize={room.previewFileSize}
                previewSender={room.previewSender}
                unreadCount={room.unreadCount}
                mentionCount={room.mentionCount}
                isMuted={room.isMuted}
                membersCount={room.members_count}
                lastActivity={room.lastActivity}
                activeCall={room.activeCall}
                active={summary.uuid === activeRoomUuid}
                onClick={() => onSelect(summary.uuid)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
