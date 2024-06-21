import { QueryFunction, useInfiniteQuery } from '@tanstack/react-query';
import { debounce } from 'lodash';
import { ComponentType, FC, useCallback, useState } from 'react';

import { InfiniteList } from '@waldur/core/InfiniteList';
import { FilterBox } from '@waldur/form/FilterBox';
import { translate } from '@waldur/i18n';
import { parseResponse } from '@waldur/table/api';

interface DataPage {
  data: any[];
  nextPage?: number;
}

const loadData: QueryFunction<DataPage> = async (context) => {
  const response = await parseResponse(
    context.meta.api as any,
    {
      page: context.pageParam,
      ...(context.meta.params as any),
    },
    { signal: context.signal },
  );
  return {
    data: response.rows,
    nextPage: response.nextPage,
  };
};

interface BreadcrumbDropdownProps {
  api: string;
  RowComponent: ComponentType<{ row }>;
  queryField: string;
  params?: Record<string, any>;
  emptyMessage?: string;
  placeholder?: string;
}

export const BreadcrumbDropdown: FC<BreadcrumbDropdownProps> = ({
  api,
  queryField,
  RowComponent,
  params = {},
  emptyMessage = translate('There are no results for this keyword.'),
  placeholder = translate('Search') + '...',
}) => {
  const [query, setQuery] = useState('');

  const applyQuery = useCallback(
    debounce((value) => {
      setQuery(String(value).trim());
    }, 1000),
    [setQuery],
  );

  const context = useInfiniteQuery<any, any, DataPage>(
    ['SearchBoxResults', api, params, query],
    loadData,
    {
      getNextPageParam: (lastPage) => lastPage.nextPage,
      meta: { api, params: { ...params, [queryField]: query } },
      refetchOnWindowFocus: false,
    },
  );

  return (
    <div>
      <div className="p-5">
        <FilterBox
          type="search"
          placeholder={placeholder}
          onChange={(e) => applyQuery(e.target.value)}
        />
      </div>
      <div className="mh-300px overflow-auto">
        <InfiniteList
          RowComponent={RowComponent}
          context={context}
          emptyMessage={emptyMessage}
        />
      </div>
    </div>
  );
};
