import { Prohibit } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { RowActionButton } from '@waldur/table/ActionButton';

import { closeReview } from './api';

interface ReviewCloseButtonProps {
  reviewId: string;
}

export const ReviewCloseButton: FC<ReviewCloseButtonProps> = ({ reviewId }) => {
  const dispatch = useDispatch();
  const callback = async () => {
    try {
      await closeReview(reviewId);
      dispatch(showSuccess(translate('Review has been performed.')));
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to perform review.')));
    }
  };
  return (
    <RowActionButton
      action={callback}
      title={translate('Perform review')}
      iconNode={<Prohibit />}
      size="sm"
    />
  );
};
