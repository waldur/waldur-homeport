import { AuthToken, authTokensDestroy } from 'waldur-js-client';

import { getUUID } from '@/core/utils';
import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const TokenDeleteButton = ({
  row,
  refetch,
}: {
  row: AuthToken;
  refetch;
}) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      authTokensDestroy({ path: { user_id: getUUID(row.url) } }),
    successMessage: translate('Token has been deleted.'),
    errorMessage: translate('Unable to delete token.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Are you sure you want to delete the token of {firstname} {lastname}?',
        {
          firstname: <strong>{row.user_first_name}</strong>,
          lastname: <strong>{row.user_last_name}</strong>,
        },
        formatJsxTemplate,
      ),
      options: { forDeletion: true },
    },
  });

  return (
    <RemovalActionItem
      title={translate('Remove')}
      action={mutate}
      disabled={isPending}
      size="sm"
    />
  );
};
