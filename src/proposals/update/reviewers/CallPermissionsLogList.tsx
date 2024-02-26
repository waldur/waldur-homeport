import { PermissionsLogList } from '@waldur/permissions/PermissionsLogList';

export const CallPermissionsLogList = ({ call }) => (
  <PermissionsLogList scope={call} />
);
