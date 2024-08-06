import {
  ArrowLeft,
  ArrowRight,
  CaretLeft,
  CaretRight,
} from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Button, Col, Row } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import Pagination from '@waldur/table/Pagination';

import { TablePageSize } from './TablePageSize';
import { Pagination as PaginationProps } from './types';

interface TablePaginationProps extends PaginationProps {
  gotoPage: (page: any) => void;
  updatePageSize: (value: number) => void;
  showPageSizeSelector: boolean;
  hasRows: boolean;
}

const MIN_PAGE_SIZE = 5;

export const TablePagination: FunctionComponent<TablePaginationProps> = (
  props,
) => {
  const from = (props.currentPage - 1) * props.pageSize + 1;
  const to = Math.min(props.currentPage * props.pageSize, props.resultCount);

  const totalPages = Math.ceil(props.resultCount / props.pageSize);
  const prevDisabled = props.currentPage <= 1;
  const nextDisabled = props.currentPage >= totalPages;

  return props.resultCount > MIN_PAGE_SIZE ? (
    <>
      <Row className="table-pagination d-none d-md-flex px-0 align-items-center mt-6">
        <Col
          sm="auto"
          lg={6}
          xl={3}
          className="d-flex align-items-start justify-content-start order-lg-2 order-xl-1"
        >
          {props.showPageSizeSelector && (
            <TablePageSize
              currentPage={props.currentPage}
              pageSize={props.pageSize}
              resultCount={props.resultCount}
              updatePageSize={props.updatePageSize}
            />
          )}
        </Col>
        <Col sm lg={12} xl={6} className="order-lg-1 order-xl-2">
          {props.hasRows && props.resultCount > props.pageSize && (
            <Pagination
              totalPages={totalPages}
              currentPage={props.currentPage}
              onChange={props.gotoPage}
              hideFirstAndLastPageLinks
              hidePreviousAndNextPageLinks
            />
          )}
        </Col>
        <Col sm="auto" lg={6} xl={3} className="order-3">
          <div className="d-flex align-items-center justify-content-end">
            {props.hasRows && (
              <div className="text-dark text-nowrap fs-6 me-4">
                {translate('{from}-{to} of {all} items', {
                  from,
                  to,
                  all: props.resultCount,
                })}
              </div>
            )}
            <div
              className={'page-item me-1' + (prevDisabled ? ' disabled' : '')}
            >
              <button
                type="button"
                className="page-link px-1"
                disabled={prevDisabled}
                onClick={() => props.gotoPage(props.currentPage - 1)}
              >
                <CaretLeft size={20} weight="bold" />
              </button>
            </div>
            <div className={'page-item' + (nextDisabled ? ' disabled' : '')}>
              <button
                type="button"
                className="page-link px-1"
                disabled={nextDisabled}
                onClick={() => props.gotoPage(props.currentPage + 1)}
              >
                <CaretRight size={20} weight="bold" />
              </button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Mobile view */}
      <div className="table-pagination d-flex d-md-none align-items-center justify-content-between mt-6">
        <div className={'page-item me-1' + (prevDisabled ? ' disabled' : '')}>
          <Button
            variant="outline"
            className="btn-outline-default btn-icon w-35px h-35px"
            disabled={prevDisabled}
            onClick={() => props.gotoPage(props.currentPage - 1)}
          >
            <ArrowLeft size={20} weight="bold" />
          </Button>
        </div>
        {props.hasRows && (
          <div className="text-dark text-nowrap fs-6 me-4">
            {translate('Page {page} of {total}', {
              page: props.currentPage,
              total: totalPages,
            })}
          </div>
        )}
        <div className={'page-item' + (nextDisabled ? ' disabled' : '')}>
          <Button
            variant="outline"
            className="btn-outline-default btn-icon w-35px h-35px"
            disabled={nextDisabled}
            onClick={() => props.gotoPage(props.currentPage + 1)}
          >
            <ArrowRight size={20} weight="bold" />
          </Button>
        </div>
      </div>
    </>
  ) : null;
};
