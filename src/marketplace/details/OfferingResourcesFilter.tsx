import { FunctionComponent } from 'react';

import { translate } from '@/i18n';
import { ResourceStateFilter } from '@/marketplace/resources/list/ResourceStateFilter';
import { BooleanFilter } from '@/table';

export const OfferingResourcesFilter: FunctionComponent = () => (
  <>
    <ResourceStateFilter ellipsis={false} instantApply={false} />
    <BooleanFilter
      title={translate('Include terminated')}
      name="include_terminated"
      badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
      label={translate('Include terminated')}
    />
  </>
);
