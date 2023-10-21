import { useSelector } from 'react-redux';

import { createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { TableOptions, TableComponent } from './LexisLinkList';

export const SupportLexisLinksList: React.ComponentType<any> = () => {
  const customer = useSelector(getCustomer);

  const tableProps = useTable({
    ...TableOptions,
    table: 'SupportLexisLinksList',
    fetchData: createFetcher('lexis-links'),
  });
  return <TableComponent customer={customer} {...tableProps} />;
};
