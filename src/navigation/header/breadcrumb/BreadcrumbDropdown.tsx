import { FunnelSimpleIcon } from '@phosphor-icons/react';
import {
  InfiniteData,
  QueryFunction,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { debounce } from 'lodash-es';
import { useCallback, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useBoolean } from 'react-use';
import { Field, getFormValues } from 'redux-form';

import { InfiniteList } from '@waldur/core/async/InfiniteList';
import { BaseAsyncListProps, RowData } from '@waldur/core/async/types';
import { isEmpty } from '@waldur/core/utils';
import { FilterBox } from '@waldur/form/FilterBox';
import { Form } from '@waldur/form/Form';
import { translate } from '@waldur/i18n';
import { DataPage, processApiResponse, SdkFunction } from '@waldur/table/api';

import { HeaderButtonBullet } from '../HeaderButtonBullet';

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
}: BreadcrumbDropdownProps<Fetcher>): JSX.Element => {
  const [query, setQuery] = useState('');
  const [filterOpen, setFilterOpen] = useBoolean(false);

  const formValues = useSelector((state) => {
    const values = getFormValues(FILTERS_FORM_ID)(state);
    return Object.keys(values || {}).reduce((acc, key) => {
      if (values[key]?.length) {
        acc[key] = values[key].map((option) => option.value);
      }
      return acc;
    }, {});
  });

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
          <Button
            variant="tertiary"
            className="btn-icon btn-toggle-filters position-relative"
            onClick={setFilterOpen}
          >
            <span className="svg-icon svg-icon-1">
              <FunnelSimpleIcon weight="bold" />
            </span>
            {!isEmpty(formValues) && (
              <HeaderButtonBullet size={8} blink={false} className="me-n2" />
            )}
          </Button>
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
