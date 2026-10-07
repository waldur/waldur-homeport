import { FunctionComponent } from 'react';
import { User } from 'waldur-js-client';

import { Checkbox } from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { formatJsx, translate } from '@/i18n';

import { useUpdateUser } from './useUpdateUser';

interface TermsOfServiceCheckboxProps {
  user: User;
}

export const TermsOfServiceCheckbox: FunctionComponent<
  TermsOfServiceCheckboxProps
> = ({ user }) => {
  const { callback, isLoading } = useUpdateUser(user);
  const isAgreed = Boolean(user.agreement_date);
  const inputId = 'tos-agreement-check';
  const labelId = 'tos-agreement-label';

  return (
    <div className="d-flex align-items-center">
      {/* A bare box and its own <label>, not Checkbox's `label`: once agreed
          the box locks, and a disabled Checkbox greys its label, but the
          acceptance text has to stay fully legible. */}
      <Checkbox
        id={inputId}
        aria-labelledby={labelId}
        checked={isAgreed}
        onChange={() => {
          if (!isAgreed) callback({ agree_with_policy: true });
        }}
        disabled={isLoading || isAgreed}
        data-testid="tos-checkbox"
      />
      <label
        id={labelId}
        htmlFor={inputId}
        className="ms-[8px] mb-0 text-[14px] leading-[20px] text-[var(--check-label)]"
      >
        {!isAgreed
          ? translate(
              'I agree to the <tos>Terms of Service</tos> and <pp>Privacy Policy</pp>',
              {
                tos: (s: string) => <Link state="about.tos" label={s} />,
                pp: (s: string) => <Link state="about.privacy" label={s} />,
              },
              formatJsx,
            )
          : translate(
              '<tos>Terms of Service</tos> and <pp>Privacy policy</pp> have been accepted on <date></date>',
              {
                tos: (s: string) => <Link state="about.tos" label={s} />,
                pp: (s: string) => <Link state="about.privacy" label={s} />,
                date: () => formatDateTime(user.agreement_date),
              },
              formatJsx,
            )}
      </label>

      {isLoading && (
        <LoadingSpinnerSimple className="ms-2" data-testid="tos-spinner" />
      )}
    </div>
  );
};
