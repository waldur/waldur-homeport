import { RobotAccountDeleteButton } from './RobotAccountDeleteButton';
import { RobotAccountEditButton } from './RobotAccountEditButton';

export const RobotAccountActions = ({ row, refetch }) =>
  row.backend_id ? (
    <>N/A</>
  ) : (
    <>
      <RobotAccountEditButton row={row} refetch={refetch} />
      <RobotAccountDeleteButton row={row} refetch={refetch} />
    </>
  );
