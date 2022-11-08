import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import Pagination from '@waldur/table/Pagination';

import { Pagination as PaginationProps } from './types';

interface TablePaginationProps extends PaginationProps {
  gotoPage: (page: any) => void;
}

export const TablePagination: FunctionComponent<TablePaginationProps> = (
  props,
) => {
  const from = (props.currentPage - 1) * props.pageSize + 1;
  const to = Math.min(props.currentPage * props.pageSize, props.resultCount);
  return props.resultCount > props.pageSize ? (
    <>
      <Pagination
        totalPages={Math.ceil(props.resultCount / props.pageSize)}
        currentPage={props.currentPage}
        onChange={props.gotoPage}
      />
      <div className="text-muted fs-6 mt-6">
        {translate('{from}-{to} of {all} items', {
          from,
          to,
          all: props.resultCount,
        })}
      </div>
    </>
  ) : null;
};
