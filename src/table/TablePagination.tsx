import * as React from 'react';

import { translate } from '@waldur/i18n';
import Pagination from '@waldur/shims/Pagination';

import { Pagination as PaginationProps } from './types';

interface TablePaginationProps extends PaginationProps {
  gotoPage: (page: any) => void;
}

export const TablePagination = (props: TablePaginationProps) => (
  <div className="text-right">
    <Pagination
      prev={translate('Previous')}
      next={translate('Next')}
      items={Math.ceil(props.resultCount / props.pageSize)}
      activePage={props.currentPage}
      onSelect={props.gotoPage}
      maxButtons={3}
      boundaryLinks={true}
    />
  </div>
);
