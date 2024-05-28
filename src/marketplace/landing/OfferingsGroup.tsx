import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';
import {
  getCustomer,
  getProject,
  getWorkspace,
} from '@waldur/workspace/selectors';
import { WorkspaceType } from '@waldur/workspace/types';

import { OfferingCard } from '../common/OfferingCard';

const field = [
  'uuid',
  'name',
  'description',
  'thumbnail',
  'image',
  'rating',
  'order_count',
  'category_uuid',
  'attributes',
  'customer_name',
  'customer_uuid',
  'state',
  'paused_reason',
];

const mapStateToFilter = createSelector(
  getCustomer,
  getProject,
  getWorkspace,
  (customer, project, workspace) => {
    const filter: Record<string, any> = {
      page_size: 6,
      field,
      state: ['Active', 'Paused'],
      allowed_customer_uuid: customer?.uuid,
      project_uuid: project?.uuid,
    };
    if (workspace === WorkspaceType.USER) {
      filter.shared = true;
    }
    return filter;
  },
);

export const OfferingsGroup = () => {
  const filter = useSelector(mapStateToFilter);
  const tableProps = useTable({
    table: 'marketplace-landing-offerings',
    filter,
    fetchData: createFetcher('marketplace-public-offerings'),
    staleTime: 3 * 60 * 1000,
  });

  return (
    <Table
      {...tableProps}
      gridItem={({ row }) => <OfferingCard offering={row} />}
      gridSize={{ lg: 6, xl: 4 }}
      mode="grid"
      title={translate('Latest offerings')}
      verboseName={translate('Offerings')}
      initialSorting={{ field: 'created', mode: 'desc' }}
      actions={
        <Link state="public.offerings" className="btn btn-light">
          {translate('All offerings')}
        </Link>
      }
      hasQuery={false}
      hasPagination={false}
    />
  );
};
