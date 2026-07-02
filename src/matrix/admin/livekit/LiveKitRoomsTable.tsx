import { CaretDownIcon, CaretRightIcon } from '@phosphor-icons/react';
import { FC, Fragment, useMemo, useState } from 'react';
import { LiveKitOverviewResponse } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { SummaryWidget } from '@/core/SummaryWidget';
import { translate } from '@/i18n';

import { LiveKitRoomDetails } from './LiveKitRoomDetails';

interface LiveKitRoomsTableProps {
  data: LiveKitOverviewResponse;
}

export const LiveKitRoomsTable: FC<LiveKitRoomsTableProps> = ({ data }) => {
  const { rooms, totals } = data;
  // Rooms can be expanded independently so several calls can be compared at once.
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());

  const toggle = (name: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });

  // LiveKit's ListRooms returns rooms in an unstable order, so each poll would
  // otherwise reshuffle the rows. Sort by name for a stable, predictable order.
  const sortedRooms = useMemo(
    () => [...rooms].sort((a, b) => a.name.localeCompare(b.name)),
    [rooms],
  );

  return (
    <>
      <SummaryWidget
        stats={[
          { label: translate('Rooms'), value: totals.room_count },
          { label: translate('Participants'), value: totals.participant_count },
          { label: translate('Publishers'), value: totals.publisher_count },
        ]}
      />
      <table className="table table-row-bordered table-hover align-middle mb-0">
        <thead>
          <tr className="fw-bold text-muted">
            <th style={{ width: 24 }} />
            <th>{translate('Room')}</th>
            <th>{translate('SID')}</th>
            <th>{translate('Participants')}</th>
            <th>{translate('Publishers')}</th>
            <th>{translate('Created')}</th>
          </tr>
        </thead>
        <tbody>
          {sortedRooms.map((room) => {
            const isOpen = expanded.has(room.name);
            return (
              <Fragment key={room.sid}>
                <tr
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggle(room.name)}
                >
                  <td>
                    {isOpen ? (
                      <CaretDownIcon weight="bold" />
                    ) : (
                      <CaretRightIcon weight="bold" />
                    )}
                  </td>
                  <td className="fw-bold">{room.name}</td>
                  <td>
                    <code>{room.sid}</code>
                  </td>
                  <td>
                    {room.max_participants
                      ? `${room.num_participants} / ${room.max_participants}`
                      : room.num_participants}
                  </td>
                  <td>{room.num_publishers}</td>
                  <td>
                    {room.creation_time
                      ? formatDateTime(room.creation_time * 1000)
                      : translate('Unknown time')}
                  </td>
                </tr>
                {isOpen && (
                  <tr>
                    <td colSpan={6} className="bg-light px-4 py-2">
                      <LiveKitRoomDetails roomName={room.name} />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </>
  );
};
