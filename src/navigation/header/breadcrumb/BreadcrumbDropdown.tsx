import { FunnelSimpleIcon } from '@phosphor-icons/react';
import {
  InfiniteData,
  QueryFunction,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { debounce, isEqual } from 'lodash-es';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useBoolean } from 'react-use';
import { Field, getFormValues } from 'redux-form';

import { InfiniteList } from '@/core/async/InfiniteList';
import { BaseAsyncListProps, RowData } from '@/core/async/types';
import { IconButton } from '@/core/buttons/IconButton';
import { isEmpty } from '@/core/utils';
import { FilterBox } from '@/form/FilterBox';
import { Form } from '@/form/Form';
import { translate } from '@/i18n';
import { DataPage, processApiResponse, SdkFunction } from '@/table/api';

import { useFavoritePages } from '../favorite-pages/FavoritePageService';
import { HeaderButtonBullet } from '../HeaderButtonBullet';

import { BreadcrumbDropdownContext } from './BreadcrumbDropdownContext';
import { FilterSelect } from './FilterSelect';

const FILTERS_FORM_ID = 'BreadcrumbsFiltersForm';

interface BreadcrumbDropdownProps<
  Fetcher extends SdkFunction,
> extends BaseAsyncListProps<Fetcher> {
  filters?: Array<{
    field: string;
    label: string;
    options: Array<{ value; label }>;
  }>;
  /** Callback to close the dropdown popover */
  close?: () => void;
}

export const BreadcrumbDropdown = <Fetcher extends SdkFunction>({
  fetcher,
  queryKey,
  queryField,
  RowComponent,
  path,
  params = {},
  filters,
  emptyMessage = translate('There are no results for this keyword.'),
  placeholder = translate('Search'),
  close,
}: BreadcrumbDropdownProps<Fetcher>): JSX.Element => {
  const [query, setQuery] = useState('');
  const { addFavoritePage, removeFavorite, isFavorite } = useFavoritePages();

  const contextValue = useMemo(
    () => ({
      addFavoritePage,
      removeFavorite,
      isFavorite,
      close: close || (() => {}),
    }),
    [addFavoritePage, removeFavorite, isFavorite, close],
  );
  const [filterOpen, setFilterOpen] = useBoolean(false);

  // Get raw form values from Redux
  const rawFormValues = useSelector(getFormValues(FILTERS_FORM_ID));

  // Memoize transformed values to prevent infinite re-renders
  const prevFormValuesRef = useRef({});
  const formValues = useMemo(() => {
    const transformed = Object.keys(rawFormValues || {}).reduce(
      (acc, key) => {
        if (rawFormValues[key]?.length) {
          acc[key] = rawFormValues[key].map((option) => option.value);
        }
        return acc;
      },
      {} as Record<string, unknown[]>,
    );
    // Only return new object if values actually changed
    if (isEqual(transformed, prevFormValuesRef.current)) {
      return prevFormValuesRef.current;
    }
    prevFormValuesRef.current = transformed;
    return transformed;
  }, [rawFormValues]);

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
        ...formValues,
        [queryField]: query,
      },
      path,
      signal,
    });
    return processApiResponse(result);
  };

  const context = useInfiniteQuery<TypedPage, Error, InfiniteData<TypedPage>>({
    queryKey: ['SearchBoxResults', queryKey, path, params, query, formValues],
    queryFn,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    refetchOnWindowFocus: false,
    throwOnError: false,
    retry: false,
  });

  return (
    <div>
      <div className="d-flex border-bottom py-2 pe-3">
        <FilterBox
          type="search"
          placeholder={placeholder}
          onChange={(e) => applyQuery(e.target.value)}
          inputClassName="border-0 shadow-none"
          className="flex-grow-1"
          autoFocus
        />

        {Boolean(filters) && (
          <div className="position-relative">
            <IconButton
              iconNode={<FunnelSimpleIcon weight="bold" />}
              tooltip={translate('Toggle filters')}
              variant="tertiary"
              className="btn-toggle-filters"
              onClick={setFilterOpen}
            />
            {!isEmpty(formValues) && (
              <HeaderButtonBullet size={8} blink={false} className="me-n2" />
            )}
          </div>
        )}
      </div>
      {filterOpen && (
        <Form
          form={FILTERS_FORM_ID}
          destroyOnUnmount={false}
          className="d-flex border-bottom py-1 px-5"
        >
          {filters.map((filter) => (
            <Field
              key={filter.field}
              name={filter.field}
              component={(fieldProps) => (
                <FilterSelect
                  placeholder={filter.label}
                  options={filter.options}
                  {...fieldProps}
                />
              )}
            />
          ))}
        </Form>
      )}
      <BreadcrumbDropdownContext.Provider value={contextValue}>
        <div className="mh-300px overflow-auto">
          <InfiniteList
            RowComponent={RowComponent}
            context={context}
            emptyMessage={emptyMessage}
          />
        </div>
      </BreadcrumbDropdownContext.Provider>
    </div>
  );
};
