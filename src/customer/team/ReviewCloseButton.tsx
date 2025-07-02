import { ProhibitIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { customerPermissionsReviewsClose } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { RowActionButton } from '@waldur/table/ActionButton';

interface ReviewCloseButtonProps {
  reviewId: string;
}

export const ReviewCloseButton: FC<ReviewCloseButtonProps> = ({ reviewId }) => {
  const dispatch = useDispatch();
  const callback = async () => {
    try {
      await customerPermissionsReviewsClose({ path: { uuid: reviewId } });
      dispatch(showSuccess(translate('Review has been performed.')));
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to perform review.')));
    }
  };
  return (
    <RowActionButton
      action={callback}
      title={translate('Perform review')}
      iconNode={<ProhibitIcon />}
      size="sm"
    />
  );
};
