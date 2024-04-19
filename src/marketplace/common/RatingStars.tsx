import classNames from 'classnames';
import { FunctionComponent } from 'react';

import { range } from '@waldur/core/utils';
import './RatingStars.scss';

interface RatingStarsProps {
  rating: number;
  max?: number;
  size?: 'default' | 'medium';
  color?: string;
  className?: string;
}

export const RatingStars: FunctionComponent<RatingStarsProps> = (props) => (
  <div
    className={classNames('rating-stars', props.className, {
      'rating-stars-default': props.size === 'default',
      'rating-stars-medium': props.size === 'medium',
    })}
    title={`${props.rating}/${props.max}`}
  >
    {range(Math.floor(props.rating)).map((key) => (
      <i className={classNames('fa fa-star filled', props.color)} key={key} />
    ))}
    {range(props.max - Math.floor(props.rating)).map((key) => (
      <i className="fa fa-star" key={key} />
    ))}
  </div>
);

RatingStars.defaultProps = {
  max: 5,
  size: 'default',
};
