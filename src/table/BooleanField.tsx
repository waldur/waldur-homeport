import classNames from 'classnames';
import { FunctionComponent } from 'react';

interface BooleanFieldProps {
  value: boolean;
}

export const BooleanField: FunctionComponent<BooleanFieldProps> = ({
  value,
}) => (
  <i
    className={classNames('fa', {
      'fa-check': value,
      'fa-minus': !value,
    })}
  />
);
