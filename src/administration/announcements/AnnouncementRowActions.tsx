import { ActionsDropdown } from '@/table/ActionsDropdown';

import { AnnouncementDeleteAction } from './AnnouncementDeleteAction';
import { AnnouncementEditButton } from './AnnouncementEditButton';

export const AnnouncementRowActions = ({ row, refetch }) => {
  return (
    <ActionsDropdown
      row={row}
      refetch={refetch}
      actions={[AnnouncementEditButton, AnnouncementDeleteAction].filter(
        Boolean,
      )}
    />
  );
};
