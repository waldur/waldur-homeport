import { FunctionComponent } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { formatJsx, translate } from '@waldur/i18n';

interface TermsOfServiceProps {
  initial?: boolean;
  agreementDate: string;
}

export const TermsOfService: FunctionComponent<TermsOfServiceProps> = (
  props,
) => (
  <div className="mb-8">
    {!props.initial
      ? props.agreementDate &&
        translate(
          '<Link>Terms of Service</Link> have been accepted on <Date></Date>',
          {
            Link: (s) => <Link state="tos.index" label={s} target="_blank" />,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            Date: (_) => formatDateTime(props.agreementDate),
          },
          formatJsx,
        )
      : translate(
          'By submitting the form you are agreeing to the <tos>Terms of Service</tos> and <pp>Privacy policy</pp>.',
          {
            tos: (s: string) => <Link state="tos.index" label={s} />,
            pp: (s: string) => <Link state="policy.privacy" label={s} />,
          },
          formatJsx,
        )}
  </div>
);

TermsOfService.defaultProps = {
  initial: false,
};
