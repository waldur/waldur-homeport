import * as React from 'react';

import './RatingStars.scss';

interface RatingStarsProps {
  rating: number;
}

export const RatingStars = (props: RatingStarsProps) => (
  <div className="rating-stars">
    {Array.from(Array(props.rating).keys()).map(() => (
      <i className="fa fa-star"/>
    ))}
  </div>
);
