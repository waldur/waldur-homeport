import { CheckIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch } from 'react-redux';
import {
  customerPermissionsReviewsClose,
  projectPermissionsReviewsClose,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@/store/notify';

interface ReviewCloseActionProps {
  row: { uuid: string };
  scope: 'customer' | 'project';
}

export const ReviewCloseAction: FC<ReviewCloseActionProps> = ({
  row,
  scope,
}) => {
  const dispatch = useDispatch();
  const callback = async () => {
    try {
      if (scope === 'customer') {
        await customerPermissionsReviewsClose({ path: { uuid: row.uuid } });
      } else if (scope === 'project') {
        await projectPermissionsReviewsClose({ path: { uuid: row.uuid } });
      }

      dispatch(showSuccess(translate('Review has been completed.')));
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to complete review.')));
    }
  };
  return (
    <ActionItem
      action={callback}
      title={translate('Complete review')}
      iconNode={<CheckIcon weight="bold" />}
    />
  );
};
