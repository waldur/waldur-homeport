import React from 'react';
import Pagination from 'react-bootstrap/lib/Pagination';
import { TranslateProps, Pagination as PaginationProps } from './types';

type Props = TranslateProps & PaginationProps & {
  gotoPage: (number) => void,
};

const TablePagination = (props: Props) => (
  <div className='text-right'>
    <Pagination
      prev={props.translate('Previous')}
      next={props.translate('Next')}
      items={Math.ceil(props.resultCount / props.pageSize)}
      activePage={props.currentPage}
      onSelect={props.gotoPage}
      maxButtons={3}
      boundaryLinks={true}
    />
  </div>
);

export default TablePagination;
