import { ArrowSquareOutIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Payment } from 'waldur-js-client';

import { translate } from '@/i18n';
import { DASH_ESCAPE_CODE } from '@/table/constants';

export const PaymentProofRenderer: FunctionComponent<{ row: Payment }> = ({
  row,
}) =>
  row.proof ? (
    <a href={row.proof} target="_blank" rel="noopener noreferrer">
      {translate('Proof document')} <ArrowSquareOutIcon weight="bold" />
    </a>
  ) : (
    <>{DASH_ESCAPE_CODE}</>
  );
