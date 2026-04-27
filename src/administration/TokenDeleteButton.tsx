import { TrashIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { AuthToken, authTokensDestroy } from 'waldur-js-client';

import { getUUID } from '@/core/utils';
import { formatJsxTemplate, translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

export const TokenDeleteButton = ({
  row,
  refetch,
}: {
  row: AuthToken;
  refetch;
}) => {
  const dispatch = useDispatch();
  const openDialog = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to delete the token of {firstname} {lastname}?',
          {
            firstname: <strong>{row.user_first_name}</strong>,
            lastname: <strong>{row.user_last_name}</strong>,
          },
          formatJsxTemplate,
        ),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    await authTokensDestroy({ path: { user_id: getUUID(row.url) } });
    refetch();
  };
  return (
    <ActionItem
      title={translate('Remove')}
      action={openDialog}
      iconNode={<TrashIcon weight="bold" />}
      size="sm"
      className="text-danger"
      iconColor="danger"
    />
  );
};
