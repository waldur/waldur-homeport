import { RobotAccountDeleteButton } from './RobotAccountDeleteButton';
import { RobotAccountEditButton } from './RobotAccountEditButton';

export const RobotAccountActions = ({ row, refetch }) => (
  <>
    <RobotAccountDeleteButton row={row} refetch={refetch} />
    <RobotAccountEditButton row={row} refetch={refetch} />
  </>
);
