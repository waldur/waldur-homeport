import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react';
import React from 'react';
import { useToggle } from 'react-use';

import { Input, InputGroup } from 'waldur-ui';

import { translate } from '@/i18n';

interface SecretValueFieldProps {
  value: string;
  className?: string;
}

/**
 * A secret shown read-only. It is a text input drawn in the
 * `text-security-disc` font rather than `type="password"`: the browser
 * refuses to copy from a password field, and this value is here to be copied.
 */
export const SecretValueField: React.FC<SecretValueFieldProps> = (props) => {
  const [showSecret, onToggle] = useToggle(false);
  const label = showSecret ? translate('Hide') : translate('Show');

  return (
    <InputGroup
      className={props.className}
      end={
        <button
          type="button"
          title={label}
          aria-label={label}
          onClick={onToggle}
          className="pointer-events-auto flex cursor-pointer items-center border-0 bg-transparent p-0 text-quaternary hover:text-secondary"
        >
          {showSecret ? (
            <EyeSlashIcon size={18} weight="bold" />
          ) : (
            <EyeIcon size={18} weight="bold" />
          )}
        </button>
      }
    >
      <Input
        readOnly
        value={props.value}
        style={showSecret ? undefined : { fontFamily: 'text-security-disc' }}
      />
    </InputGroup>
  );
};
