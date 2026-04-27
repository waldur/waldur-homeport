import { CallDocumentsCard } from '@/proposals/details/CallDocumentsCard';
import { RemoveDocumentAction } from '@/proposals/update/documents/RemoveDocumentButton';
import { ActionsDropdown } from '@/table/ActionsDropdown';

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
