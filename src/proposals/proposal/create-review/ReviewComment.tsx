import classNames from 'classnames';
import { FC, PropsWithChildren } from 'react';
import { FormLabel } from 'react-bootstrap';

import Avatar from '@/core/Avatar';
import { translate } from '@/i18n';

import { RateStars } from './RateStars';

interface ReviewCommentProps {
  title?: string;
  image?: string | null;
  score?: number;
  time?: string;
  className?: string;
}

export const ReviewComment: FC<PropsWithChildren<ReviewCommentProps>> = (
  props,
) => {
  return (
    <div
      className={classNames(
        'review-comment flex p-5 gap-4',
        'bg-brand-subtle',
        props.className,
      )}
    >
      <Avatar
        labelClassName="bg-tertiary text-quaternary"
        name={props.title}
        src={props.image}
        size={32}
        circle
      />

      <div>
        <FormLabel className="mb-0">
          {props.title}
          {Boolean(props.time) && (
            <small className="text-quaternary ms-2 font-normal">
              {props.time}
            </small>
          )}
        </FormLabel>
        {props.children ? (
          <p
            className="text-quaternary mb-0"
            style={{ whiteSpace: 'pre-line' }}
          >
            {props.children}
          </p>
        ) : (
          <p className="text-quaternary fst-italic mb-0">
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
