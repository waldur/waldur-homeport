import { Pagination } from '@react-bootstrap/pagination';
import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { Pagination as PaginationProps } from '@waldur/table/types';
import './GridPagination.scss';

interface GridPaginationProps extends PaginationProps {
  gotoPage: (page: any) => void;
}

export const GridPagination: FunctionComponent<GridPaginationProps> = (props) =>
  props.resultCount > props.pageSize ? (
    <div className="gridPaginationContainer">
      <Pagination
        prev={
          <>
            <i className="fa fa-chevron-left m-r" /> {translate('Previous')}
          </>
        }
        next={
          <>
            {translate('Next')} <i className="fa fa-chevron-right m-l" />
          </>
        }
        items={Math.ceil(props.resultCount / props.pageSize)}
        activePage={props.currentPage}
        onSelect={props.gotoPage}
        maxButtons={3}
        boundaryLinks={true}
      />
    </div>
  ) : null;
