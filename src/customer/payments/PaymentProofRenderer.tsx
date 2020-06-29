import * as React from 'react';

import { translate } from '@waldur/i18n';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';

export const PaymentProofRenderer = ({ row }) =>
  row.proof ? (
    <a href={row.proof} target="_blank" rel="noopener noreferrer">
      {translate('Proof document')} <i className="fa fa-external-link" />
    </a>
  ) : (
    <>{DASH_ESCAPE_CODE}</>
  );
