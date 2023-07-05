import { useSelector } from 'react-redux';

import { useTable } from '@waldur/table/utils';

import {
  TableOptions,
  TableComponent,
  mapPropsToFilter,
} from './PublicResourcesList';
import { SupportResourcesFilter } from './SupportResourcesFilter';

export const SupportResourcesList: React.ComponentType<any> = () => {
  const filter = useSelector((state) =>
    mapPropsToFilter(state, 'SupportResourcesFilter'),
  );
  const tableProps = useTable({
    ...TableOptions,
    table: 'SupportResourcesList',
    filter,
  });
  return (
    <TableComponent {...tableProps} filters={<SupportResourcesFilter />} />
  );
};
