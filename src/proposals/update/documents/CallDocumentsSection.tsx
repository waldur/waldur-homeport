import { CallDocumentsCard } from '@waldur/proposals/details/CallDocumentsCard';
import { RemoveDocumentButton } from '@waldur/proposals/update/documents/RemoveDocumentButton';

import { AttachDocumentsButton } from './AttachDocumentsButton';

export const CallDocumentsSection = ({ call, refetch }) => {
  const tableActions = <AttachDocumentsButton call={call} refetch={refetch} />;
  const rowActions = ({ row }) => (
    <RemoveDocumentButton file={row} call={call} refetch={refetch} />
  );

  return (
    <CallDocumentsCard
      call={call}
      tableActions={tableActions}
      rowActions={rowActions}
    />
  );
};
