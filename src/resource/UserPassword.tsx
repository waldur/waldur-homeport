import * as classNames from 'classnames';
import * as React from 'react';
import useToggle from 'react-use/lib/useToggle';

import { translate } from '@waldur/i18n';

interface UserPasswordProps {
  password: string;
}

export const UserPassword: React.FC<UserPasswordProps> = props => {
  const [showPassword, toggle] = useToggle(false);
  return (
    <>
      <a
        className={classNames('fa', {
          'fa-eye': !showPassword,
          'fa-eye-slash': showPassword,
        })}
        title={translate('Show password')}
        onClick={toggle}
      />{' '}
      {showPassword ? props.password : '***************'}
    </>
  );
};
