import React from 'react';

import { translate } from '@waldur/i18n';

export const InvitationExpandableRow: React.FC<{
  row;
}> = ({ row }) => (
  <>
    <p>
      <b>{translate('Invitation link')}: </b>
      {row.link_template.replace('{uuid}', row.uuid)}
    </p>
    {row.civil_number ? (
      <p>
        <b>{translate('Civil number')}: </b>
        {row.civil_number}
      </p>
    ) : null}
  </>
);
