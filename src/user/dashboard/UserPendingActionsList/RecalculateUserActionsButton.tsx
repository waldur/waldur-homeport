import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { userActionsUpdateActions } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showSuccess, showErrorResponse } from '@/store/notify';
import { getUser } from '@/workspace/selectors';

export const RecalculateUserActionsButton: FC<{ refetch?: () => void }> = ({
  refetch,
}) => {
  const dispatch = useDispatch();
  const currentUser = useSelector(getUser);

  if (!currentUser?.is_staff) {
    return null;
  }

  const onClick = async () => {
    try {
      await userActionsUpdateActions();
      dispatch(
        showSuccess(
          translate('User actions have been recalculated successfully.'),
        ),
      );
      if (refetch) {
        refetch();
      }
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to recalculate user actions.')),
      );
    }
  };

  return (
    <ActionItem
      title={translate('Recalculate user actions')}
      action={onClick}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
    />
  );
};
