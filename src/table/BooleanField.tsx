import classNames from 'classnames';
import { FunctionComponent } from 'react';

interface Props {
  value: boolean;
}

export const BooleanField: FunctionComponent<Props> = ({ value }) => (
  <i
    className={classNames('fa', {
      'fa-check': value,
      'fa-minus': !value,
    })}
  />
);
