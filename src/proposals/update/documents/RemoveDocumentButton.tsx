import { proposalProtectedCallsDetachDocuments } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const RemoveDocumentAction = ({ row, call, refetch }) => {
  const removeMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      proposalProtectedCallsDetachDocuments({
        path: { uuid: call.uuid },
        body: { documents: [row.uuid] },
      }),
    successMessage: translate('Documents have been removed.'),
    errorMessage: translate(
      'An error occurred while removing documents. Please try again.',
    ),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Are you sure you want to remove {document} document from {call}?',
        {
          document: row.file_name
            .split('/')
            .pop()
            .replace(/_[^_]+\./, '.'),
          call: call.name,
        },
      ),
      options: { forDeletion: true },
    },
  });

  return (
    <RemovalActionItem
      disabled={removeMutation.isPending}
      action={() => removeMutation.mutate()}
      title={translate('Remove')}
    />
  );
};
