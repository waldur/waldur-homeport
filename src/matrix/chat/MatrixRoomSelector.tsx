import { FC } from 'react';

import { translate } from '@/i18n';

interface Room {
  uuid: string;
  room_name?: string;
  room_alias?: string;
}

interface MatrixRoomSelectorProps {
  rooms: Room[];
  activeRoomUuid: string;
  onSelect: (roomUuid: string) => void;
}

export const MatrixRoomSelector: FC<MatrixRoomSelectorProps> = ({
  rooms,
  activeRoomUuid,
  onSelect,
}) => {
  if (rooms.length <= 1) return null;

  return (
    <div className="px-4 py-2 border-bottom">
      <select
        className="form-select form-select-sm"
        value={activeRoomUuid}
        onChange={(e) => onSelect(e.target.value)}
        aria-label={translate('Select chat room')}
      >
        {rooms.map((room) => (
          <option key={room.uuid} value={room.uuid}>
            {room.room_name || room.room_alias || room.uuid}
          </option>
        ))}
      </select>
    </div>
  );
};
