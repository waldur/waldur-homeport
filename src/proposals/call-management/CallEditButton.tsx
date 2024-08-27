import { EditButton } from '@waldur/form/EditButton';

export const CallEditButton = ({ row }) => (
  <EditButton
    state="protected-call.main"
    params={{ call_uuid: row.uuid }}
    size="sm"
  />
);
