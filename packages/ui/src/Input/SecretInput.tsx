import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react';
import { forwardRef, useState } from 'react';
import { translate } from 'waldur-i18n-runtime';

import { Input, InputProps } from './Input';
import { InputGroup } from './InputGroup';

export type SecretInputProps = Omit<InputProps, 'type'>;

/**
 * A password-style input with a show/hide button inside its right edge.
 * `autoComplete` defaults to `new-password` so browsers do not fill a stored
 * login into a token field.
 */
export const SecretInput = forwardRef<HTMLInputElement, SecretInputProps>(
  ({ autoComplete = 'new-password', ...props }, ref) => {
    const [shown, setShown] = useState(false);
    return (
      <InputGroup
        invalid={props.invalid}
        end={
          <button
            type="button"
            title={shown ? translate('Hide') : translate('Show')}
            aria-label={translate('Show')}
            aria-pressed={shown}
            onClick={() => setShown((v) => !v)}
            className="pointer-events-auto flex cursor-pointer items-center border-0 bg-transparent p-0 text-quaternary hover:text-secondary"
          >
            {shown ? (
              <EyeSlashIcon size={18} weight="bold" />
            ) : (
              <EyeIcon size={18} weight="bold" />
            )}
          </button>
        }
      >
        <Input
          ref={ref}
          type={shown ? 'text' : 'password'}
          autoComplete={autoComplete}
          {...props}
        />
      </InputGroup>
    );
  },
);
SecretInput.displayName = 'SecretInput';
