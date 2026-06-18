import { DateTime } from 'luxon';
import { FunctionComponent } from 'react';

import { DateGroup } from '@/form';
import { translate } from '@/i18n';

export const ExpirationTimeGroup: FunctionComponent<{
  disabled?: boolean;
}> = ({ disabled }) => {
  return (
    <DateGroup
      name="expiration_time"
      disabled={disabled}
      minDate={DateTime.now().plus({ days: 1 }).toISO()}
      placeholder="YYYY-MM-DD"
      label={translate('Role expires on')}
      spaceless
    />
  );
};
