import { ArrowSquareOut } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';

export const PaymentProofRenderer: FunctionComponent<{ row }> = ({ row }) =>
  row.proof ? (
    <a href={row.proof} target="_blank" rel="noopener noreferrer">
      {translate('Proof document')} <ArrowSquareOut />
    </a>
  ) : (
    <>{DASH_ESCAPE_CODE}</>
  );
