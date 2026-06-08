import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react';
import React from 'react';
import { useToggle } from 'react-use';

import { translate } from '@/i18n';

interface UserPasswordProps {
  password: string;
}

export const UserPassword: React.FC<UserPasswordProps> = (props) => {
  const [showPassword, toggle] = useToggle(false);
  return (
    <>
      <button
        className="text-btn"
        type="button"
        title={
          showPassword ? translate('Hide password') : translate('Show password')
        }
        onClick={toggle}
        data-testid="toggle-password"
      >
        {showPassword ? (
          <EyeSlashIcon size={17} weight="bold" />
        ) : (
          <EyeIcon size={17} weight="bold" />
        )}
        &nbsp;
      </button>
      {showPassword ? props.password : '***************'}
    </>
  );
};
