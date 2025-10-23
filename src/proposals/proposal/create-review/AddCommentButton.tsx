import { ChatDotsIcon } from '@phosphor-icons/react';
import { Button } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { isReviewInFinalState } from '@waldur/proposals/utils';

export const AddCommentButton = ({
  review,
  onClick,
  className = undefined,
}) => {
  const disabled = isReviewInFinalState(review?.state);

  return (
    <Tip
      id="form-add-comment-tooltip"
      label={translate('Add comment')}
      className={className}
    >
      <Button
        variant="text-primary"
        className="btn-icon"
        onClick={onClick}
        disabled={disabled}
      >
        <span className="svg-icon svg-icon-1x me-0">
          <ChatDotsIcon weight="bold" />
        </span>
      </Button>
    </Tip>
  );
};
