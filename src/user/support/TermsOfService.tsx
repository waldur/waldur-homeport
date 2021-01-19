import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';
import { formatJsx, translate } from '@waldur/i18n';

interface TermsOfServiceProps {
  initial?: boolean;
  agreementDate: string;
}

export const TermsOfService: FunctionComponent<TermsOfServiceProps> = (
  props,
) => {
  return (
    <div className="form-group">
      <div className="col-sm-offset-3 col-sm-9">
        {!props.initial
          ? props.agreementDate &&
            translate(
              '<Link>Terms of Service</Link> have been accepted on <Date></Date>',
              {
                Link: (s) => <Link state="tos.index" label={s} />,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                Date: (_) => props.agreementDate,
              },
              formatJsx,
            )
          : translate(
              'By submitting the form you are agreeing to the <Link>Terms of Service</Link>.',
              {
                Link: (s: string) => <Link state="tos.index" label={s} />,
              },
              formatJsx,
            )}
      </div>
    </div>
  );
};

TermsOfService.defaultProps = {
  initial: false,
};
