import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';
import { formatJsx, translate } from '@waldur/i18n';

export const UserAuthWarning: FunctionComponent = () => (
  <p>
    {translate(
      'By authenticating you are agreeing to the <tos>Terms of Service</tos> and <pp>Privacy policy</pp>.',
      {
        tos: (s: string) => <Link state="tos.index" label={s} />,
        pp: (s: string) => <Link state="policy.privacy" label={s} />,
      },
      formatJsx,
    )}
  </p>
);
