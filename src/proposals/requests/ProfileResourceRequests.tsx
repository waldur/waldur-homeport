import { FC } from 'react';

import { translate } from '@/i18n';
import { useTitle } from '@/navigation/title';

import { ResourceRequestsList } from './ResourceRequestsList';

/** Every resource the user has requested through a proposal, across all offerings. */
export const ProfileResourceRequests: FC = () => {
  useTitle(translate('Resource requests'));
  return <ResourceRequestsList />;
};
