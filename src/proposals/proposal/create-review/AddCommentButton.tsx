import { ChatDotsIcon } from '@phosphor-icons/react';

import { translate } from '@waldur/i18n';
import { isReviewInFinalState } from '@waldur/proposals/utils';
import { ActionButton } from '@waldur/table/ActionButton';

export const AddCommentButton = ({
  review,
  onClick,
  className = undefined,
}) => {
  const disabled = isReviewInFinalState(review?.state);

  return (
    <ActionButton
      action={onClick}
      iconNode={<ChatDotsIcon weight="bold" />}
      variant="text-primary"
      disabled={disabled}
      tooltip={translate('Add comment')}
      className={className}
    />
  );
};
