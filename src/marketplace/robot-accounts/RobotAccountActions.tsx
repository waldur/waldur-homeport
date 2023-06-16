import { RobotAccountDeleteButton } from './RobotAccountDeleteButton';
import { RobotAccountEditButton } from './RobotAccountEditButton';

export const RobotAccountActions = ({ row, refetch }) =>
  row.backend_id ? (
    <>N/A</>
  ) : (
    <>
      <RobotAccountDeleteButton row={row} refetch={refetch} />
      <RobotAccountEditButton row={row} refetch={refetch} />
    </>
  );
