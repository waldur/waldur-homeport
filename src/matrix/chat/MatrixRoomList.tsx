import { FC, useMemo, useState } from 'react';

import {
  BaseButton,
  SegmentedControl,
  SegmentedControlOption,
} from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SidebarToggleGraphic } from '@/core/SidebarToggleGraphic';
import { FilterBox } from '@/form/FilterBox';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';

import { RoomCallState } from './call/useAllRoomCallStates';
import { MatrixRoomListItem } from './MatrixRoomListItem';
import { MatrixRoomRailItem } from './MatrixRoomRailItem';
import { PreviewKind } from './previewClassifier';
import {
  buildRoomSections,
  ChatRoomSummary,
  matchesKind,
  RoomFilter,
  RoomKindFilter,
} from './roomSections';

interface EnrichedRoom {
  uuid: string;
  room_name?: string;
  scope_name?: string;
  scope_type?: string | null;
  scope_subtitle?: string | null;
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
  /**
   * Which kind of room to list: Team chat's team rooms, or the step
   * discussions; every room by default, as on the Communication page.
   */
  kind?: RoomKindFilter;
}

export const MatrixRoomList: FC<MatrixRoomListProps> = ({
  rooms,
  isLoading,
  onSelect,
  activeRoomUuid,
  collapsed,
  onToggleCollapse,
  kind = 'all',
}) => {
  const [filter, setFilter] = useState<RoomFilter>('all');
  const [search, setSearch] = useState('');

  const activeRooms = useMemo(
    () =>
      rooms.filter(
        (r) =>
          r.state === 'active' &&
          matchesKind({ scopeType: r.scope_type }, kind),
      ),
    [rooms, kind],
  );
  // A list of one kind need not mark each room with it.
  const markKind = kind === 'all';

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
        scopeType: r.scope_type,
        scopeSubtitle: r.scope_subtitle,
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

  const filterOptions: SegmentedControlOption<RoomFilter>[] = useMemo(
    () => [
      { value: 'all', label: translate('All') },
      { value: 'unread', label: translate('Unread') },
      { value: 'mentions', label: translate('Mentions') },
    ],
    [],
  );

  if (collapsed) {
    return (
      <div className="team-chat">
        {/* The collapse control is hidden in the design, but a persisted
            collapsed state still needs an escape back to the full list. */}
        {onToggleCollapse && (
          <div className="tc-sidebar-top">
            <BaseButton
              iconNode={
                <span className="aui-icon-rotate-180">
                  <SidebarToggleGraphic />
                </span>
              }
              tooltip={translate('Expand sidebar')}
              onClick={onToggleCollapse}
              variant="tertiary-ghost"
              size="md"
            />
          </div>
        )}
        <div className="tc-rail">
          {orderedRooms.map((room) => (
            <MatrixRoomRailItem
              key={room.uuid}
              uuid={room.uuid}
              name={room.name}
              scopeType={room.scopeType}
              scopeSubtitle={room.scopeSubtitle}
              markKind={markKind}
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
      <div className="team-chat">
        <div className="tc-placeholder">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const hasRooms = activeRooms.length > 0;
  const isEmpty = visibleRooms.length === 0;
  const isFiltered = filter !== 'all' || search.trim().length > 0;

  return (
    <div className="team-chat">
      <div className="tc-sidebar-top">
        <FilterBox
          type="search"
          placeholder={translate('Search...')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <SegmentedControl<RoomFilter>
          aria-label={translate('Filter conversations')}
          options={filterOptions}
          value={filter}
          onValueChange={setFilter}
          className="self-start"
        />
      </div>

      {isEmpty ? (
        <div className="tc-placeholder">
          {!hasRooms ? (
            <NoResult
              title={translate('No conversations yet')}
              message={
                kind === 'step_discussion'
                  ? translate(
                      'The discussions of the workflow steps you work on appear here once someone starts them.',
                    )
                  : kind === 'project'
                    ? translate('Rooms for your projects appear here.')
                    : translate(
                        'Rooms for your projects, and for the discussions of the workflow steps you work on, appear here.',
                      )
              }
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
                scopeType={room.scope_type}
                scopeSubtitle={room.scope_subtitle}
                markKind={markKind}
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
