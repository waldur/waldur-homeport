import { CaretDownIcon, CaretRightIcon } from '@phosphor-icons/react';
import { FC, Fragment, useMemo, useState } from 'react';
import { LiveKitOverviewResponse } from 'waldur-js-client';

import {
  Code,
  StatCardGrid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
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
      <StatCardGrid
        stats={[
          { label: translate('Rooms'), value: totals.room_count },
          { label: translate('Participants'), value: totals.participant_count },
          { label: translate('Publishers'), value: totals.publisher_count },
        ]}
      />
      <Table density="compact" className="align-middle mb-0">
        <TableHeader>
          <TableRow className="font-medium text-quaternary">
            <TableHead style={{ width: 24 }} />
            <TableHead>{translate('Room')}</TableHead>
            <TableHead>{translate('SID')}</TableHead>
            <TableHead>{translate('Participants')}</TableHead>
            <TableHead>{translate('Publishers')}</TableHead>
            <TableHead>{translate('Created')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRooms.map((room) => {
            const isOpen = expanded.has(room.name);
            return (
              <Fragment key={room.sid}>
                <TableRow
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggle(room.name)}
                >
                  <TableCell>
                    {isOpen ? (
                      <CaretDownIcon weight="bold" />
                    ) : (
                      <CaretRightIcon weight="bold" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{room.name}</TableCell>
                  <TableCell>
                    <Code>{room.sid}</Code>
                  </TableCell>
                  <TableCell>
                    {room.max_participants
                      ? `${room.num_participants} / ${room.max_participants}`
                      : room.num_participants}
                  </TableCell>
                  <TableCell>{room.num_publishers}</TableCell>
                  <TableCell>
                    {room.creation_time
                      ? formatDateTime(room.creation_time * 1000)
                      : translate('Unknown time')}
                  </TableCell>
                </TableRow>
                {isOpen && (
                  <TableRow hoverable={false}>
                    <TableCell
                      colSpan={6}
                      className="bg-tertiary dark:bg-quaternary px-3 py-1.5"
                    >
                      <LiveKitRoomDetails roomName={room.name} />
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};
