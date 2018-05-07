import * as React from 'react';

import { range } from '@waldur/core/utils';

import './RatingStars.scss';

interface RatingStarsProps {
  rating: number;
  max?: number;
}

export const RatingStars: React.SFC<RatingStarsProps> = (props: RatingStarsProps) => (
  <div className="rating-stars">
    {range(props.rating).map(key => <i className="fa fa-star filled" key={key}/>)}
    {range(props.max - props.rating).map(key => <i className="fa fa-star" key={key}/>)}
  </div>
);

RatingStars.defaultProps = {
  max: 5,
};
