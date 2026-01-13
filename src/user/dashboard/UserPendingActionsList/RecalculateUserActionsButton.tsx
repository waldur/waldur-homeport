import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { userActionsUpdateActions } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

export const RecalculateUserActionsButton: FC<{ refetch?: () => void }> = ({
  refetch,
}) => {
  const dispatch = useDispatch();

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
