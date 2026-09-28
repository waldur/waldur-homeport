import { ChatDotsIcon } from '@phosphor-icons/react';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { isReviewInFinalState } from '@/proposals/utils';

export const AddCommentButton = ({
  review,
  onClick,
  className = undefined,
}) => {
  const disabled = isReviewInFinalState(review?.state);

  return (
    <BaseButton
      onClick={onClick}
      iconNode={<ChatDotsIcon weight="bold" />}
      variant="text-primary"
      disabled={disabled}
      tooltip={translate('Add comment')}
      className={className}
      size="lg"
    />
  );
};
