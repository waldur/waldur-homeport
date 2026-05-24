import { broadcastMessageTemplatesList } from 'waldur-js-client';

import { createLoadOptions } from '@/form/select';

export const templateAutocomplete = createLoadOptions(
  broadcastMessageTemplatesList,
  'name',
);
