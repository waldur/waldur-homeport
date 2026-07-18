import { marketplaceOfferingFilesDestroy, Offering } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const RemoveDocumentAction = ({
  row,
  offering,
  refetch,
}: {
  row: { uuid: string; name: string };
  offering: Offering;
  refetch(): void;
}) => {
  const removeMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceOfferingFilesDestroy({
        path: { uuid: row.uuid },
      }),
    successMessage: translate('Document has been removed.'),
    errorMessage: translate(
      'An error occurred while removing the document. Please try again.',
    ),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Are you sure you want to remove {document} document from {offering}?',
        {
          document: row.name,
          offering: offering.name,
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
