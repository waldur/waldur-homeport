import { FunctionComponent } from 'react';

import Pagination from '@waldur/table/Pagination';

import { Pagination as PaginationProps } from './types';

interface TablePaginationProps extends PaginationProps {
  gotoPage: (page: any) => void;
}

export const TablePagination: FunctionComponent<TablePaginationProps> = (
  props,
) =>
  props.resultCount > props.pageSize ? (
    <div className="text-right">
      <Pagination
        totalPages={Math.ceil(props.resultCount / props.pageSize)}
        currentPage={props.currentPage}
        onChange={props.gotoPage}
      />
    </div>
  ) : null;
