import { FunctionComponent } from 'react';
import {
  marketplaceProviderOfferingsListCustomerProjectsList,
  ProviderOfferingDetails as Offering,
} from 'waldur-js-client';

import { ProjectsListTable } from '@/project/ProjectsList';
import { createFetcher } from '@/table/api';
import { useTable } from '@/table/useTable';

interface OfferingCustomerProjectsTableProps {
  offering: Offering;
  tabs: any[];
}

export const OfferingCustomerProjectsTable: FunctionComponent<
  OfferingCustomerProjectsTableProps
> = ({ offering, tabs }) => {
  const projectsTableProps = useTable({
    table: `offering-projects-${offering.uuid}`,
    fetchData: createFetcher(
      marketplaceProviderOfferingsListCustomerProjectsList,
      {
        path: { uuid: offering.uuid },
      },
    ),
    queryField: 'query',
  });

  return (
    <ProjectsListTable
      {...projectsTableProps}
      tabs={tabs}
      tableActions={null}
      rowActions={null}
    />
  );
};
