import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { ResourceStateField } from '@waldur/marketplace/resources/list/ResourceStateField';

export const bookingStateAliases = (state: string): string => {
  switch (state) {
    case 'Creating': {
      return translate('Unconfirmed');
    }
    case 'OK': {
      return translate('Accepted');
    }
    case 'Terminated': {
      return translate('Rejected');
    }
    default: {
      return state;
    }
  }
};

export const BookingStateField: FunctionComponent<{ row }> = ({ row }) => (
  <ResourceStateField
    row={{
      ...row,
      state: bookingStateAliases(row.state),
    }}
  />
);
