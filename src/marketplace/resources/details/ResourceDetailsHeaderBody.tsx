import { useQuery } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import {
  PublicOfferingDetails,
  Resource,
  marketplaceOfferingUsersList,
} from 'waldur-js-client';

import { getUser } from '@waldur/workspace/selectors';

import { EndDateField } from './EndDateField';
import { OfferingDetailsField } from './OfferingDetailsField';
import { OfferingUserDetailsField } from './OfferingUserDetailsField';

interface ResourceDetailsHeaderBodyProps {
  resource: Resource;
  offering: PublicOfferingDetails;
}

export const ResourceDetailsHeaderBody: FunctionComponent<
  ResourceDetailsHeaderBodyProps
> = ({ resource, offering }) => {
  const user = useSelector(getUser);

  const { data: offeringUser } = useQuery({
    queryKey: ['fetchOfferingUser', user?.uuid, offering?.uuid],
    queryFn: () =>
      user?.uuid && offering?.uuid
        ? marketplaceOfferingUsersList({
            query: {
              user_uuid: user.uuid,
              offering_uuid: [offering.uuid],
              field: ['uuid', 'username', 'state', 'service_provider_comment'],
            },
          }).then((response) => response.data[0] || null)
        : null,
    enabled: !!(user?.uuid && offering?.uuid),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <>
      {resource.description ? <p>{resource.description}</p> : null}
      <OfferingDetailsField offering={offering} />
      <EndDateField resource={resource} />
      <OfferingUserDetailsField offeringUser={offeringUser} />
    </>
  );
};
