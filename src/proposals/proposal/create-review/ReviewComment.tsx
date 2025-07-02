import classNames from 'classnames';
import { FC, PropsWithChildren } from 'react';
import { FormLabel } from 'react-bootstrap';

import Avatar from '@waldur/core/Avatar';
import { translate } from '@waldur/i18n';

import { RateStars } from './RateStars';

interface ReviewCommentProps {
  title?: string;
  score?: number;
  time?: string;
  className?: string;
}

export const ReviewComment: FC<PropsWithChildren<ReviewCommentProps>> = (
  props,
) => {
  return (
    <div
      className={classNames('review-comment d-flex p-5 gap-4', props.className)}
    >
      <Avatar
        labelClassName="bg-primary-200 text-primary-700"
        name={props.title}
        size={32}
        circle
      />

      <div className="fw-semibold">
        <FormLabel className="mb-0">
          {props.title}
          {Boolean(props.time) && (
            <small className="text-muted ms-2 fw-normal">{props.time}</small>
          )}
        </FormLabel>
        {props.children ? (
          <p className="text-muted mb-0" style={{ whiteSpace: 'pre-line' }}>
            {props.children}
          </p>
        ) : (
          <p className="text-muted fst-italic mb-0">
            {translate('No explanation')}
          </p>
        )}
        {(props.score || props.score === 0) && (
          <RateStars value={props.score} size={16} />
        )}
      </div>
    </div>
  );
};
