import { CompactEditButton } from '@waldur/form/CompactEditButton';

export const CallEditButton = ({ row }) => (
  <CompactEditButton
    state="protected-call.main"
    params={{ call_uuid: row.uuid }}
    variant="secondary"
  />
);
