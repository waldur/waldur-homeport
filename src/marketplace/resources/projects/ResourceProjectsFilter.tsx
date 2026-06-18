import { FC } from 'react';

import { translate } from '@/i18n';
import { BooleanFilter } from '@/table';

export const RESOURCE_PROJECTS_FILTER_FORM_ID = 'resource-projects-filter';

export const ResourceProjectsFilter: FC = () => (
  <BooleanFilter
    title={translate('Show removed')}
    name="include_removed"
    badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
    label={translate('Show removed')}
  />
);
