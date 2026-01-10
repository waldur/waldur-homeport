import { CallDocumentsCard } from '@waldur/proposals/details/CallDocumentsCard';
import { RemoveDocumentAction } from '@waldur/proposals/update/documents/RemoveDocumentButton';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

import { AttachDocumentsButton } from './AttachDocumentsButton';

export const CallDocumentsSection = ({ call, refetch }) => {
  const tableActions = <AttachDocumentsButton call={call} refetch={refetch} />;
  const rowActions = ({ row }) => (
    <ActionsDropdown row={row} refetch={refetch} data={{ call }}>
      <RemoveDocumentAction row={row} call={call} refetch={refetch} />
    </ActionsDropdown>
  );

  return (
    <CallDocumentsCard
      call={call}
      tableActions={tableActions}
      rowActions={rowActions}
    />
  );
};
