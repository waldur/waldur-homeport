import * as React from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';

interface TermsOfServiceProps {
  initial?: boolean;
  agreementDate: string;
}

export const TermsOfService: React.SFC<TermsOfServiceProps> = (props: TermsOfServiceProps) => {
  return (
    <div className="form-group">
      <div className="col-sm-offset-3 col-sm-9">
        {!props.initial ?
          (
            props.agreementDate &&
              <>
                <Link state="tos.index" label={translate('Terms of Service')}/>&nbsp;
                {translate('have been accepted on')}&nbsp;
                {props.agreementDate}
              </>) : (
            <>
              {translate('By submitting the form you are agreeing to the')}&nbsp;
              <Link state="tos.index" label={translate('Terms of Service')}/>
            </>
          )
        }
      </div>
    </div>
  );
};

TermsOfService.defaultProps = {
  initial: false,
};
