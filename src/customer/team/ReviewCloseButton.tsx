import { CheckIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch } from 'react-redux';
import {
  customerPermissionsReviewsClose,
  projectPermissionsReviewsClose,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { RowActionButton } from '@waldur/table/ActionButton';

interface ReviewCloseButtonProps {
  scope: 'customer' | 'project';
  reviewId: string;
}

export const ReviewCloseButton: FC<ReviewCloseButtonProps> = ({
  reviewId,
  scope,
}) => {
  const dispatch = useDispatch();
  const callback = async () => {
    try {
      if (scope === 'customer') {
        await customerPermissionsReviewsClose({ path: { uuid: reviewId } });
      } else if (scope === 'project') {
        await projectPermissionsReviewsClose({ path: { uuid: reviewId } });
      }

      dispatch(showSuccess(translate('Review has been completed.')));
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to complete review.')));
    }
  };
  return (
    <RowActionButton
      action={callback}
      title={translate('Complete review')}
      iconNode={<CheckIcon weight="bold" />}
      size="sm"
    />
  );
};
