import { useMutation } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { formatJsx, translate } from '@waldur/i18n';
import { UserDetails } from '@waldur/workspace/types';

interface TermsOfServiceCheckboxProps {
  user: UserDetails;
  update: (formData: any, dispatch: any) => Promise<void>;
}

export const TermsOfServiceCheckbox: FunctionComponent<
  TermsOfServiceCheckboxProps
> = ({ user, update }) => {
  const dispatch = useDispatch();
  const { mutate: agree, isLoading } = useMutation(() =>
    update({ agree_with_policy: true }, dispatch),
  );

  return (
    <div className="d-flex align-items-center">
      <Form.Check type="checkbox">
        <Form.Check.Input
          type="checkbox"
          checked={Boolean(user.agreement_date)}
          onChange={() => !user.agreement_date && agree()}
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
