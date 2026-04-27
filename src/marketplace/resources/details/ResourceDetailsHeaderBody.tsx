import { useQuery } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import {
  PublicOfferingDetails,
  Resource,
  marketplaceOfferingUsersList,
  projectsRetrieve,
} from 'waldur-js-client';

import { STALE_TIME } from '@/core/constants';
import { getUser } from '@/workspace/selectors';

import { BackendIdField } from './BackendIdField';
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

  const { data: project } = useQuery({
    queryKey: ['display-project-billing', resource.project_uuid],
    queryFn: () =>
      resource.project_uuid
        ? projectsRetrieve({
            path: { uuid: resource.project_uuid },
            query: { field: ['customer_display_billing_info_in_projects'] },
          }).then((response) => response.data)
        : null,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });
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
    staleTime: STALE_TIME,
  });

  return (
    <>
      {resource.description ? <p>{resource.description}</p> : null}
      <OfferingDetailsField
        offering={offering}
        concealBillingInfo={
          project?.customer_display_billing_info_in_projects === false
        }
      />
      <BackendIdField resource={resource} offering={offering} />
      <EndDateField resource={resource} />
      <OfferingUserDetailsField offeringUser={offeringUser} />
    </>
  );
};
