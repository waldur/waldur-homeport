import { Star } from '@phosphor-icons/react';
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
      <Star weight="fill" className={props.color} key={key} />
    ))}
    {range(max - Math.floor(props.rating)).map((key) => (
      <Star key={key} />
    ))}
  </div>
);
