import * as React from 'react';
import { TranslateProps } from '@waldur/i18n/types';
import { Pagination } from './types';

type Props = TranslateProps & Pagination;

const TableInfo = ({ translate, currentPage, pageSize, resultCount }: Props) => {
  const context = {
    sliceStart: Math.min(resultCount, (currentPage - 1) * pageSize + 1),
    sliceEnd: Math.min(resultCount, currentPage * pageSize),
    resultCount: resultCount,
  };

  const message = translate('Showing {sliceStart} to {sliceEnd} of {resultCount} entries.', context);
  return (
    <div className='dataTables_info'>
      {message}
    </div>
  );
};

export default TableInfo;
