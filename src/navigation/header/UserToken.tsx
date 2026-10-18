import { CopyIcon } from '@phosphor-icons/react';
import classNames from 'classnames';

import { buttonVariants, cn, inputVariants, Menu } from 'waldur-ui';

import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';

/**
 * The user's API token, masked, with a Copy button: a menu item, so arrow
 * keys reach it. Choosing the row copies the token; the field and the
 * button are its look only, hidden from screen readers (the token is a
 * secret), which hear "Copy API token". The menu stays open.
 */
export const UserToken = ({ token }: { token: string }) => {
  const { showSuccess } = useNotify();

  return (
    <Menu.CopyItem
      value={token}
      aria-label={translate('Copy API token')}
      onCopied={() => showSuccess(translate('Token has been copied'))}
    >
      <span className="flex grow items-center me-2 text-nowrap">
        {translate('API token')}
      </span>
      <span className="flex w-full items-stretch" aria-hidden="true">
        {/* Sized like the <input> this replaces: contain:inline-size stops the
            token text from widening it. */}
        <span
          className={cn(
            inputVariants({ size: 'sm', solid: true }),
            'h-30px min-w-0 flex-1 rounded-e-none overflow-hidden whitespace-nowrap [contain:inline-size]',
          )}
          style={{ fontFamily: 'text-security-disc' }}
        >
          {token}
        </span>
        <span
          className={classNames(
            buttonVariants({ variant: 'primary', size: 'sm' }),
            'px-3 h-30px rounded-s-none',
          )}
        >
          <span className="inline-flex size-4 shrink-0 items-center justify-center [&>svg]:size-4">
            <CopyIcon weight="bold" />
          </span>
          {translate('Copy')}
        </span>
      </span>
    </Menu.CopyItem>
  );
};
