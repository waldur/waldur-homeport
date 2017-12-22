import * as classNames from 'classnames';
import * as React from 'react';

interface Props {
  value: boolean;
}

const BooleanField = ({ value }: Props) => (
  <a className="bool-field">
    <i className={classNames('fa', {
      'fa-check': value,
      'fa-minus': !value,
    })}/>
  </a>
);

export default BooleanField;
