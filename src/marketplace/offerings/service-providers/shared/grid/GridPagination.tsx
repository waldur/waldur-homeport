import { FunctionComponent } from 'react';

import Pagination from '@waldur/table/Pagination';
import { Pagination as PaginationProps } from '@waldur/table/types';
import './GridPagination.scss';

interface GridPaginationProps extends PaginationProps {
  gotoPage: (page: any) => void;
}

export const GridPagination: FunctionComponent<GridPaginationProps> = (props) =>
  props.resultCount > props.pageSize ? (
    <div className="gridPaginationContainer">
      <Pagination
        totalPages={Math.ceil(props.resultCount / props.pageSize)}
        currentPage={props.currentPage}
        onChange={props.gotoPage}
      />
    </div>
  ) : null;
