import classNames from 'classnames';
import React from 'react';

interface Props {
  value: boolean;
}

export const BooleanField = ({ value }: Props) => (
  <i
    className={classNames('fa', {
      'fa-check': value,
      'fa-minus': !value,
    })}
  />
);
