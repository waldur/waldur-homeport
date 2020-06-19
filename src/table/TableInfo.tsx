import * as React from 'react';

import { translate } from '@waldur/i18n';

import { Pagination } from './types';

export const TableInfo = ({
  currentPage,
  pageSize,
  resultCount,
}: Pagination) => {
  const context = {
    sliceStart: Math.min(resultCount, (currentPage - 1) * pageSize + 1),
    sliceEnd: Math.min(resultCount, currentPage * pageSize),
    resultCount,
  };

  const message = translate(
    'Showing {sliceStart} to {sliceEnd} of {resultCount} entries.',
    context,
  );
  return <div className="dataTables_info">{message}</div>;
};
