import { ChatDots } from '@phosphor-icons/react';
import { Button } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { getReviewStateOptions } from '@waldur/proposals/utils';

export const AddCommentButton = ({
  review,
  onClick,
  className = undefined,
}) => {
  const disabled =
    review?.state !== getReviewStateOptions()[0].value &&
    review?.state !== getReviewStateOptions()[1].value;
  return (
    <Tip
      id="form-add-comment-tooltip"
      label={translate('Add comment')}
      className={className}
    >
      <Button variant="flush" onClick={onClick} disabled={disabled}>
        <span className="svg-icon svg-icon-2x">
          <ChatDots weight="bold" className="text-primary" />
        </span>
      </Button>
    </Tip>
  );
};
