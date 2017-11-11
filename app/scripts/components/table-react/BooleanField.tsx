import React from 'react';
import classNames from 'classnames';

type Props = {
  value: boolean,
};

const BooleanField = ({ value }: Props) => (
  <a className='bool-field'>
    <i className={classNames('fa', {
      'fa-check': value,
      'fa-minus': !value,
    })}/>
  </a>
);

export default BooleanField;
