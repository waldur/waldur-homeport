import classNames from 'classnames';
import { FunctionComponent } from 'react';

import { range } from '@waldur/core/utils';
import './RatingStars.scss';

interface RatingStarsProps {
  rating: number;
  max?: number;
  size?: 'default' | 'medium';
}

export const RatingStars: FunctionComponent<RatingStarsProps> = (props) => (
  <div
    className={classNames('rating-stars', {
      'rating-stars-default': props.size === 'default',
      'rating-stars-medium': props.size === 'medium',
    })}
  >
    {range(props.rating).map((key) => (
      <i className="fa fa-star filled" key={key} />
    ))}
    {range(props.max - props.rating).map((key) => (
      <i className="fa fa-star" key={key} />
    ))}
  </div>
);

RatingStars.defaultProps = {
  max: 5,
  size: 'default',
};
