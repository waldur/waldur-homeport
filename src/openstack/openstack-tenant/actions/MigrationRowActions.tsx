import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

import { DeleteMigrationAction } from '../DeleteMigrationAction';

export const MigrationRowActions = ({ row, refetch }) => {
  return (
    <ActionsDropdown
      row={row}
      refetch={refetch}
      actions={[
        () => <DeleteMigrationAction resource={row} refetch={refetch} />,
      ].filter(Boolean)}
    />
  );
};
