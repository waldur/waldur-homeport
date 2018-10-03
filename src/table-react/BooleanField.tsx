import * as classNames from 'classnames';
import * as React from 'react';

interface Props {
  value: boolean;
}

const BooleanField = ({ value }: Props) => (
  <i className={classNames('fa', {
    'fa-check': value,
    'fa-minus': !value,
  })}/>
);

export default BooleanField;
