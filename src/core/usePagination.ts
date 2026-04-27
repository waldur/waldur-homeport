import { useMemo, useState } from 'react';
import { FieldArrayRenderProps } from 'react-final-form-arrays';

import { PAGE_SIZE_COMPACT } from '@/table/constants';

export const usePagination = <
  T extends FieldArrayRenderProps<any, any>['fields'] | any[],
>(
  items: T,
) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_COMPACT);

  const changePageSize = (newSize) => {
    if (newSize !== pageSize) {
      setPage(1);
      setPageSize(newSize);
    }
  };

  // Visible items for each page without lossing indexes
  const visibleItems = useMemo(() => {
    const end = page * pageSize;
    const start = (page - 1) * pageSize;

    return items.map((item, i) => (i >= start && i < end ? item : null)) as any;
  }, [items, page, pageSize]);

  const refreshPageOnAdd = () => {
    // We have to give pagination a timeout to create the new page, otherwise we will get an error.
    setTimeout(() => {
      setPage(Math.ceil((items.length + 1) / pageSize));
    }, 250);
  };

  const refreshPageOnRemove = () => {
    const isLastOne = visibleItems.filter(Boolean).length === 1;
    const lastPage = Math.ceil((items.length + 1) / pageSize);
    if (isLastOne && page === lastPage && page !== 1) {
      setPage((prev) => prev - 1);
    }
  };

  return {
    page,
    setPage,
    pageSize,
    changePageSize,
    visibleItems: visibleItems as T,
    refreshPageOnAdd,
    refreshPageOnRemove,
    hasPages: items.length > PAGE_SIZE_COMPACT,
  };
};
