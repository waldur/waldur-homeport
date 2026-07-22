import { FunctionComponent } from 'react';

import { translate } from '@/i18n';
import { BooleanFilter } from '@/table';

export const UserEventsFilter: FunctionComponent = () => (
  <BooleanFilter
    title={translate('All related events')}
    name="include_related"
    badgeValue={(value) => (value ? translate('Yes') : null)}
    ellipsis={false}
    parse={(v) => v || undefined}
  />
);

export const UserEventsFilterFormId = 'UserEventsFilter';
