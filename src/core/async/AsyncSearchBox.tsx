import {
  InfiniteData,
  QueryFunction,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { debounce } from 'lodash-es';
import { useCallback, useEffect, useRef, useState } from 'react';

import { FilterBox } from '@/form/FilterBox';
import { translate } from '@/i18n';
import { DataPage, processApiResponse, SdkFunction } from '@/table/api';

import useOnScreen from '../useOnScreen';

import { InfiniteList } from './InfiniteList';
import { BaseAsyncListProps, RowData } from './types';

interface AsyncSearchBoxProps<
  Fetcher extends SdkFunction,
> extends BaseAsyncListProps<Fetcher> {
  className?: string;
  wrapperClassName?: string;
}

export const AsyncSearchBox = <Fetcher extends SdkFunction>({
  fetcher,
  queryKey,
  queryField,
  RowComponent,
  path,
  params = {},
  emptyMessage = translate('There are no results for this keyword.'),
  placeholder = translate('Search...'),
  className,
  wrapperClassName,
}: AsyncSearchBoxProps<Fetcher>): JSX.Element => {
  const [enabled, setEnabled] = useState(false);
  const [query, setQuery] = useState('');

  const applyQuery = useCallback(
    debounce((value) => {
      setQuery(String(value).trim());
    }, 1000),
    [setQuery],
  );

  type TypedPage = DataPage<RowData<Fetcher>>;

  const queryFn: QueryFunction<TypedPage, unknown[], number> = async ({
    pageParam = 1,
    signal,
  }) => {
    const result = await fetcher({
      query: {
        page: pageParam,
        ...params,
        [queryField]: query,
      },
      path,
      signal,
    });
    return processApiResponse(result);
  };

  const context = useInfiniteQuery<TypedPage, Error, InfiniteData<TypedPage>>({
    queryKey: ['SearchBoxResults', queryKey, params, query],
    queryFn,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
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
