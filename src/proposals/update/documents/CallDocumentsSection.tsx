import { CallDocumentsCard } from '@/proposals/details/CallDocumentsCard';
import { RemoveDocumentAction } from '@/proposals/update/documents/RemoveDocumentButton';
import { getCallReadOnlyReason } from '@/proposals/utils';
import { ActionsDropdown } from '@/table/ActionsDropdown';

import { AttachDocumentsButton } from './AttachDocumentsButton';

export const CallDocumentsSection = ({ call, refetch, isReadOnly }) => {
  const tableActions = (
    <AttachDocumentsButton
      call={call}
      refetch={refetch}
      disabled={isReadOnly}
      tooltip={isReadOnly ? getCallReadOnlyReason(call) : undefined}
    />
  );
  const rowActions = ({ row }) =>
    isReadOnly ? (
      <ActionsDropdown disabled tooltip={getCallReadOnlyReason(call)} />
    ) : (
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
