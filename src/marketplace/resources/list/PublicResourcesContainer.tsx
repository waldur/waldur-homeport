import { FunctionComponent } from 'react';

import { useDestroyFilterOnLeave } from '@waldur/core/filters';

import { PUBLIC_RESOURCES_LIST_FILTER_FORM_ID } from './constants';
import { PublicResourcesFilter } from './PublicResourcesFilter';
import { PublicResourcesList } from './PublicResourcesList';

export const PublicResourcesContainer: FunctionComponent = () => {
  useDestroyFilterOnLeave(PUBLIC_RESOURCES_LIST_FILTER_FORM_ID);
  return <PublicResourcesList filters={<PublicResourcesFilter />} />;
};
