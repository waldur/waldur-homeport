import React from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { showError, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';

import { closeReview } from './api';

interface ReviewCloseButtonProps {
  reviewId: string;
}

export const ReviewCloseButton: React.FC<ReviewCloseButtonProps> = ({
  reviewId,
}) => {
  const dispatch = useDispatch();
  const callback = async () => {
    try {
      await closeReview(reviewId);
      dispatch(showSuccess(translate('Review has been performed.')));
    } catch (e) {
      dispatch(showError(translate('Unable to perform review.')));
    }
  };
  return (
    <ActionButton
      action={callback}
      title={translate('Perform review')}
      icon="fa fa-ban"
    />
  );
};
