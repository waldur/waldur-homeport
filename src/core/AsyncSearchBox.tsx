import { QueryFunction, useInfiniteQuery } from '@tanstack/react-query';
import { debounce } from 'lodash-es';
import {
  ComponentType,
  FC,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { FilterBox } from '@waldur/form/FilterBox';
import { translate } from '@waldur/i18n';
import { parseResponse } from '@waldur/table/api';

import { InfiniteList } from './InfiniteList';
import useOnScreen from './useOnScreen';

export interface DataPage {
  data: any[];
  nextPage?: number;
}

export const loadData: QueryFunction<DataPage> = async (context) => {
  const response = await parseResponse(
    `api${context.meta.api}`,
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

interface AsyncSearchBoxProps {
  api: string;
  RowComponent: ComponentType<{ row }>;
  queryField: string;
  params?: Record<string, any>;
  emptyMessage?: string;
  placeholder?: string;
  className?: string;
  wrapperClassName?: string;
}

export const AsyncSearchBox: FC<AsyncSearchBoxProps> = ({
  api,
  queryField,
  RowComponent,
  params = {},
  emptyMessage = translate('There are no results for this keyword.'),
  placeholder = translate('Search') + '...',
  className,
  wrapperClassName,
}) => {
  const [enabled, setEnabled] = useState(false);
  const [query, setQuery] = useState('');

  const applyQuery = useCallback(
    debounce((value) => {
      setQuery(String(value).trim());
    }, 1000),
    [setQuery],
  );

  const context = useInfiniteQuery<any, any, DataPage>({
    queryKey: ['SearchBoxResults', api, params, query],
    queryFn: loadData,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    meta: { api, params: { ...params, [queryField]: query } },
    refetchOnWindowFocus: false,
    enabled,
  });

  const refPopup = useRef<HTMLInputElement>();
  const isVisible = useOnScreen(refPopup);
  // Start fetching data when popup is visible
  useEffect(() => {
    if (isVisible) setEnabled(true);
  }, [isVisible]);

  return (
    <div id="search-box-wrapper" className={wrapperClassName}>
      <div
        data-kt-menu-trigger="click"
        data-kt-menu-attach="parent"
        data-kt-menu-placement="bottom"
        aria-hidden="true"
      >
        <FilterBox
          type="search"
          placeholder={placeholder}
          onChange={(e) => applyQuery(e.target.value)}
          className={className}
        />
      </div>
      <div
        ref={refPopup}
        className="search-results-dropdown menu menu-sub menu-sub-dropdown menu-column border mw-400px mh-300px py-2"
        data-kt-menu="true"
      >
        <div className="overflow-auto">
          <InfiniteList
            RowComponent={RowComponent}
            context={context}
            emptyMessage={emptyMessage}
          />
        </div>
      </div>
    </div>
  );
};
