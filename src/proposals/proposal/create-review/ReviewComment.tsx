import classNames from 'classnames';
import { FC, PropsWithChildren } from 'react';

import { Avatar, FormHeading, PropertyItem, PropertyList } from 'waldur-ui';

import { translate } from '@/i18n';

import { RateStars } from './RateStars';

interface ReviewCommentProps {
  title?: string;
  image?: string | null;
  score?: number;
  time?: string;
  className?: string;
  /** Below a table, about all of it: plain key/value rows. */
  nested?: boolean;
}

/** As an expanded row's details read: one key/value row each. */
const NestedReviewComment: FC<PropsWithChildren<ReviewCommentProps>> = (
  props,
) => (
  <PropertyList variant="summary" className={props.className}>
    <PropertyItem label={translate('Reviewer')} value={props.title} />
    <PropertyItem label={translate('Date')} value={props.time} />
    <PropertyItem
      label={translate('Comment')}
      value={
        <>
          {props.children ? (
            <span style={{ whiteSpace: 'pre-line' }}>{props.children}</span>
          ) : (
            <span className="italic">{translate('No explanation')}</span>
          )}
          {(props.score || props.score === 0) && (
            <RateStars value={props.score} size={16} />
          )}
        </>
      }
    />
  </PropertyList>
);

export const ReviewComment: FC<PropsWithChildren<ReviewCommentProps>> = (
  props,
) => {
  if (props.nested) return <NestedReviewComment {...props} />;
  return (
    <div
      className={classNames(
        'review-comment flex p-4 gap-3',
        'bg-brand-subtle',
        props.className,
      )}
    >
      <Avatar
        fallbackClassName="bg-tertiary text-quaternary"
        name={props.title}
        src={props.image}
        size={32}
      />

      <div>
        <FormHeading className="mb-0">
          {props.title}
          {Boolean(props.time) && (
            <small className="text-quaternary ms-1.5 font-normal">
              {props.time}
            </small>
          )}
        </FormHeading>
        {props.children ? (
          <p
            className="text-quaternary mb-0"
            style={{ whiteSpace: 'pre-line' }}
          >
            {props.children}
          </p>
        ) : (
          <p className="text-quaternary italic mb-0">
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
