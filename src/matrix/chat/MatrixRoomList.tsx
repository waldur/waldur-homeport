import { FC, useMemo, useState } from 'react';
import { Nav } from 'react-bootstrap';

import { MediumIconButton } from '@/core/buttons/IconButton';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SidebarToggleGraphic } from '@/core/SidebarToggleGraphic';
import { FilterBox } from '@/form/FilterBox';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';

import { RoomCallState } from './call/useAllRoomCallStates';
import { MatrixRoomListItem } from './MatrixRoomListItem';
import { MatrixRoomRailItem } from './MatrixRoomRailItem';
import {
  buildRoomSections,
  ChatRoomSummary,
  RoomFilter,
  RoomSection,
} from './roomSections';

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

const sectionLabel = (key: RoomSection['key']): string => {
  switch (key) {
    case 'unread':
      return translate('Unread');
    case 'recent':
      return translate('Recent');
    default:
      return translate('Results');
  }
};

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

  const sections = useMemo(
    () => buildRoomSections(summaries, filter, search),
    [summaries, filter, search],
  );

  // Flattened, unread-first room order for the collapsed rail — same
  // ordering as the expanded list so collapse/expand never reshuffles.
  const orderedRooms = useMemo(
    () => buildRoomSections(summaries, 'all', '').flatMap((s) => s.rooms),
    [summaries],
  );

  // Identical markup to the AI history sidebar's toggle — same icon, same
  // rotation class — so the two sidebars render the button identically.
  const toggleButton = onToggleCollapse ? (
    <MediumIconButton
      iconNode={
        <span className={collapsed ? 'aui-icon-rotate-180' : ''}>
          <SidebarToggleGraphic />
        </span>
      }
      tooltip={
        collapsed ? translate('Expand sidebar') : translate('Collapse sidebar')
      }
      onClick={onToggleCollapse}
      variant="tertiary-ghost"
    />
  ) : null;

  if (collapsed) {
    return (
      <div className="team-chat tc-sidebar tc-sidebar--collapsed">
        <div className="tc-sidebar-top">
          <div className="aui-history-header">{toggleButton}</div>
        </div>
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
  const isEmpty = sections.length === 0;
  const isFiltered = filter !== 'all' || search.trim().length > 0;

  const tab = (key: RoomFilter, label: string) => (
    <Nav.Item className="flex-fill text-center">
      <Nav.Link
        as="button"
        active={filter === key}
        onClick={() => setFilter(key)}
        className="w-100"
      >
        {label}
      </Nav.Link>
    </Nav.Item>
  );

  return (
    <div className="team-chat tc-sidebar">
      <div className="tc-sidebar-top">
        <div className="aui-history-header">
          {toggleButton}
          <span className="aui-history-header-title">
            {translate('History')}
          </span>
        </div>
        <FilterBox
          type="search"
          placeholder={translate('Search chats...')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Nav variant="tabs" className="nav-line-tabs w-100">
          {tab('all', translate('All'))}
          {tab('unread', translate('Unread'))}
          {tab('mentions', translate('Mentions'))}
        </Nav>
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
          {sections.map((section) => (
            <div key={section.key} className="tc-group">
              <div className="tc-group-label fw-bold fs-7 text-muted">
                {sectionLabel(section.key)}
              </div>
              {section.rooms.map((summary) => {
                const room = byUuid.get(summary.uuid);
                if (!room) return null;
                return (
                  <MatrixRoomListItem
                    key={summary.uuid}
                    uuid={summary.uuid}
                    name={summary.name}
                    scopeName={room.scope_name}
                    preview={room.preview}
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
          ))}
        </div>
      )}
    </div>
  );
};
