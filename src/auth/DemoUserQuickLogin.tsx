import { SignInIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useState } from 'react';
import { DemoPresetUser, demoPresetStatusRetrieve } from 'waldur-js-client';

import { AlertItem, BaseButton, Card, cn } from 'waldur-ui';

import { isDemoPresetsEnabled } from '@/administration/demo-presets/gate';
import { format } from '@/core/ErrorMessageFormatter';
import { translate } from '@/i18n';

import { redirectOnSuccess } from './authNavigation';
import * as AuthService from './AuthService';

const DEMO_USERS_QUERY_KEY = ['demo-preset-users'];

// The status endpoint never lists staff or support users; this is a second
// line, since their passwords would give anyone portal-wide access.
const canQuickLogin = (user: DemoPresetUser) =>
  !user.is_staff && !user.is_support && Boolean(user.password);

interface DemoUserQuickLoginProps {
  /**
   * `inline`: a section under the sign-in methods. `card`: a card of its own,
   * for the hero column beside the sign-in column.
   */
  variant?: 'inline' | 'card';
  className?: string;
}

/**
 * One-click sign-in as the demo users of the preset loaded last. Only on a
 * deployment that enables demo presets.
 */
export const DemoUserQuickLogin: FC<DemoUserQuickLoginProps> = ({
  variant = 'inline',
  className,
}) => {
  const enabled = isDemoPresetsEnabled();
  const { data } = useQuery({
    queryKey: DEMO_USERS_QUERY_KEY,
    queryFn: () => demoPresetStatusRetrieve().then(({ data }) => data),
    enabled,
    retry: false,
    meta: { skipGlobalErrorRedirect: true },
  });
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const users = (data?.users ?? []).filter(canQuickLogin);
  if (!enabled || !users.length) {
    return null;
  }

  const signin = async (user: DemoPresetUser) => {
    setPending(user.username);
    setError(null);
    try {
      const result = await AuthService.signin(user.username, user.password);
      if (result.status === 'authenticated') {
        await redirectOnSuccess();
      } else {
        setError(
          translate('{username} must confirm with a passkey to sign in.', {
            username: user.username,
          }),
        );
      }
    } catch (e) {
      const formatted = format(e);
      setError(
        typeof formatted === 'string'
          ? formatted
          : formatted?.message || translate('Unable to sign in.'),
      );
    } finally {
      setPending(null);
    }
  };

  const section = (
    <section
      className={
        variant === 'card'
          ? undefined
          : cn('mt-6 border-t border-t-secondary pt-4', className)
      }
      aria-labelledby="demo-quick-login-title"
      data-testid="demo-quick-login"
    >
      <h2
        id="demo-quick-login-title"
        className="mb-1 text-sm font-semibold text-primary"
      >
        {translate('Demo users')}
      </h2>
      <p className="mb-3 text-xs text-tertiary">
        {translate('Sign in as one of the demo’s users with one click.')}
      </p>
      {error && (
        <AlertItem
          variant="error"
          type="floating"
          iconSize="md"
          className="mb-3"
          title={error}
        />
      )}
      {/* In the card the list scrolls, so a preset with many users does not
          grow the card past the hero column; the padding keeps the buttons'
          focus rings inside the scroll box. */}
      <ul
        className={cn(
          'm-0 flex list-none flex-col gap-2 p-0',
          variant === 'card' && 'min-h-0 overflow-y-auto p-0.5',
        )}
      >
        {users.map((user) => (
          <li key={user.username}>
            <BaseButton
              variant="tertiary"
              className="w-full justify-start text-left"
              onClick={() => signin(user)}
              disabled={pending !== null}
              disabledReason={translate('Signing in')}
              iconNode={<SignInIcon weight="bold" />}
              label={
                <span className="flex min-w-0 flex-col items-start">
                  <span className="font-medium">{user.username}</span>
                  {user.email && (
                    <span className="truncate text-xs text-tertiary">
                      {user.email}
                    </span>
                  )}
                </span>
              }
              data-testid={`demo-quick-login-${user.username}`}
            />
          </li>
        ))}
      </ul>
    </section>
  );

  // The card is waldur-ui's, drawn on the section itself. It may shrink to
  // min-h-40 in the hero column, below which the column scrolls instead.
  return variant === 'card' ? (
    <Card
      asChild
      className={cn('w-full max-w-90 min-h-40 p-5 text-left', className)}
    >
      {section}
    </Card>
  ) : (
    section
  );
};
