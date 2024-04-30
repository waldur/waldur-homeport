import classNames from 'classnames';
import { FC } from 'react';

import { range } from '@waldur/core/utils';
import './RatingStars.scss';

interface RatingStarsProps {
  rating: number;
  max?: number;
  size?: 'default' | 'medium';
  color?: string;
  className?: string;
}

export const RatingStars: FC<RatingStarsProps> = ({
  max = 5,
  size = 'default',
  ...props
}) => (
  <div
    className={classNames('rating-stars', props.className, {
      'rating-stars-default': size === 'default',
      'rating-stars-medium': size === 'medium',
    })}
    title={`${props.rating}/${max}`}
  >
    {range(Math.floor(props.rating)).map((key) => (
      <i className={classNames('fa fa-star filled', props.color)} key={key} />
    ))}
    {range(max - Math.floor(props.rating)).map((key) => (
      <i className="fa fa-star" key={key} />
    ))}
  </div>
);
