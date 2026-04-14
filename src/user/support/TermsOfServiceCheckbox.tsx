import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { User } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { LoadingSpinnerSimple } from '@waldur/core/LoadingSpinner';
import { formatJsx, translate } from '@waldur/i18n';

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

  return (
    <div className="d-flex align-items-center">
      <Form.Check type="checkbox">
        <Form.Check.Input
          id={inputId}
          type="checkbox"
          checked={isAgreed}
          onChange={() => {
            if (!isAgreed) callback({ agree_with_policy: true });
          }}
          disabled={isLoading || isAgreed}
          data-testid="tos-checkbox"
        />

        <Form.Check.Label htmlFor={inputId} className="opacity-100">
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
        </Form.Check.Label>
      </Form.Check>

      {isLoading && (
        <LoadingSpinnerSimple className="ms-2" data-testid="tos-spinner" />
      )}
    </div>
  );
};
