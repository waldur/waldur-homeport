import { FunctionComponent } from 'react';

import { range } from '@waldur/core/utils';

import { FormField } from './types';

export const StarRatingField: FunctionComponent<FormField> = (props) => {
  const { input } = props;

  return (
    <div className="rating">
      {range(5).map((i) => (
        <>
          <label className="rating-label" htmlFor={`kt_rating_input_${i + 1}`}>
            <i className="fa fa-star fs-1"></i>{' '}
          </label>
          <input
            className="rating-input"
            name={input.name}
            onChange={input.onChange}
            value={i + 1}
            type="radio"
            id={`kt_rating_input_${i + 1}`}
          />
        </>
      ))}
    </div>
  );
};
