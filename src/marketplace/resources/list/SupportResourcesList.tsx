import { useSelector } from 'react-redux';

import { useTable } from '@waldur/table/utils';

import {
  TableOptions,
  TableComponent,
  mapStateToFilter,
} from './PublicResourcesList';
import { SupportResourcesFilter } from './SupportResourcesFilter';

export const SupportResourcesList: React.ComponentType<any> = () => {
  const filter = useSelector((state) =>
    mapStateToFilter(state, 'SupportResourcesFilter'),
  );
  delete filter.provider_uuid;
  const tableProps = useTable({
    ...TableOptions,
    table: 'SupportResourcesList',
    filter,
  });
  return (
    <TableComponent {...tableProps} filters={<SupportResourcesFilter />} />
  );
};
