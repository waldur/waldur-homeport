import { CheckIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import {
  customerPermissionsReviewsClose,
  projectPermissionsReviewsClose,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

interface ReviewCloseActionProps {
  row: { uuid: string };
  scope: 'customer' | 'project';
}

export const ReviewCloseAction: FC<ReviewCloseActionProps> = ({
  row,
  scope,
}) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      scope === 'customer'
        ? customerPermissionsReviewsClose({ path: { uuid: row.uuid } })
        : projectPermissionsReviewsClose({ path: { uuid: row.uuid } }),
    successMessage: translate('Review has been completed.'),
    errorMessage: translate('Unable to complete review.'),
  });
  return (
    <ActionItem
      action={mutate}
      disabled={isPending}
      title={translate('Complete review')}
      iconNode={<CheckIcon weight="bold" />}
    />
  );
};
