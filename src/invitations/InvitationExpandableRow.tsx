import React from 'react';

import { translate } from '@waldur/i18n';

export const InvitationExpandableRow: React.FC<{
  row;
}> = ({ row }) =>
  row.civil_number ? (
    <p>
      <b>{translate('Civil number')}: </b>
      {row.civil_number}
    </p>
  ) : null;
