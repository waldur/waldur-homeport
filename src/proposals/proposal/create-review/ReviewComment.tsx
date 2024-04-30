import classNames from 'classnames';
import { FC, PropsWithChildren } from 'react';

import { translate } from '@waldur/i18n';
import { RatingStars } from '@waldur/marketplace/common/RatingStars';

interface ReviewCommentProps {
  title?: string;
  score?: number;
  className?: string;
}

export const ReviewComment: FC<PropsWithChildren<ReviewCommentProps>> = (
  props,
) => {
  return (
    <div
      className={classNames(
        'review-comment rounded fst-italic bg-light-warning py-4 px-6',
        props.className,
      )}
      style={{ whiteSpace: 'pre-line' }}
    >
      {props.title && <b>{props.title}: </b>}
      {props.children ? (
        props.children
      ) : (
        <span className="text-muted">{translate('No explanation')}</span>
      )}
      {(props.score || props.score === 0) && (
        <RatingStars
          rating={props.score}
          size="medium"
          color="text-dark"
          className="d-block mb-0"
        />
      )}
    </div>
  );
};
