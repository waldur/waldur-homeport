import { FC } from 'react';

import { BooleanGroup } from '@/form';
import { translate } from '@/i18n';

/** The explicit flag a GID outside the project group range needs. */
export const OutsideRangeField: FC<{ disabled?: boolean }> = ({ disabled }) => (
  <BooleanGroup
    name="allow_outside_range"
    label={translate('Allow a GID outside the project group range')}
    description={translate(
      'For a GID your directory assigned before Waldur managed it. A GID held by anything else at this service provider, or lying in another of its pools, is refused either way.',
    )}
    disabled={disabled}
  />
);
