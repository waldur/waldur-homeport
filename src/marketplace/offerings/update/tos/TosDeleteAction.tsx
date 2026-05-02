import { truncate } from 'lodash-es';
import { marketplaceOfferingTermsOfServiceDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const TosDeleteAction = ({ row, refetch }) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceOfferingTermsOfServiceDestroy({
        path: { uuid: row.uuid },
      }),
    confirmation: {
      title: translate('Delete ToS'),
      body: translate(
        'You are going to delete {tosName}. This action is irreversible. The ToS will be permanently removed.',
        {
          tosName:
            row.version || truncate(row.terms_of_service, { length: 50 }),
        },
      ),
      options: { forDeletion: true },
    },
    successMessage: translate(
      'Terms of Service has been deleted successfully.',
    ),
    errorMessage: translate('Unable to delete Terms of Service.'),
    refetch,
  });

  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={mutate}
      disabled={isPending}
    />
  );
};
