import { organizationGroupsList } from 'waldur-js-client';

import { createLoadOptions } from '@/form/select';

export const organizationGroupAutocomplete = createLoadOptions(
  organizationGroupsList,
  'name',
  { o: 'name' },
);
