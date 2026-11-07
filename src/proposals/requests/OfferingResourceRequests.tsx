import { FC } from 'react';
import { Offering } from 'waldur-js-client';

import { translate } from '@/i18n';

import { ResourceRequestsList } from './ResourceRequestsList';

/** The offering-page tab: the current user's requests for this offering only. */
export const OfferingResourceRequests: FC<{ offering: Offering }> = ({
  offering,
}) => (
  <div className="mb-8" id="my-requests">
    <ResourceRequestsList
      offeringUuid={offering.uuid}
      title={translate('My requests')}
      standalone={false}
    />
  </div>
);
