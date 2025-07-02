import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { User } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { formatJsx, translate } from '@waldur/i18n';

import { useUpdateUser } from './useUpdateUser';

interface TermsOfServiceCheckboxProps {
  user: User;
}

export const TermsOfServiceCheckbox: FunctionComponent<
  TermsOfServiceCheckboxProps
> = ({ user }) => {
  const { callback, isLoading } = useUpdateUser(user);
  return (
    <div className="d-flex align-items-center">
      <Form.Check type="checkbox">
        <Form.Check.Input
          type="checkbox"
          checked={Boolean(user.agreement_date)}
          onChange={() => {
            !user.agreement_date && callback({ agree_with_policy: true });
          }}
          disabled={isLoading || Boolean(user.agreement_date)}
        />

        <Form.Check.Label className="opacity-100">
          {!user.agreement_date
            ? translate(
                'You agree to the <tos>Terms of Service</tos> and <pp>Privacy policy</pp>.',
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

      {isLoading && <LoadingSpinnerIcon className="ms-2" />}
    </div>
  );
};
