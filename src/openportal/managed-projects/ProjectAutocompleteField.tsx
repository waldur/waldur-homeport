import { debounce } from 'lodash-es';
import { FunctionComponent, useCallback, useMemo } from 'react';
import {
  openportalUnmanagedProjectsList,
  OpenportalUnmanagedProjectsListData,
} from 'waldur-js-client';

import { parseSelectData } from '@/core/api';
import { returnReactSelectAsyncPaginateObject } from '@/core/utils';
import { AsyncPaginate } from '@/form/themed-select';
import { FormField } from '@/form/types';
import { translate } from '@/i18n';

interface ProjectAutocompleteProps extends FormField {
  placeholder?: string;
  validator?: any;
  query?: Record<string, any>;
  noOptionsMessage?: string;
  reactSelectProps?: any;
  debounceMs?: number;
}

// Improved autocomplete function with proper error handling
const unmanagedProjectAutocomplete = async (
  searchQuery: string,
  prevOptions,
  currentPage: number,
  options: Partial<OpenportalUnmanagedProjectsListData['query']> = {},
): Promise<{
  options;
  hasMore: boolean;
  additional?: { page: number };
}> => {
  try {
    const response = await openportalUnmanagedProjectsList({
      query: {
        query: searchQuery,
        page: currentPage,
        field:
          options.field ||
          ([
            'name',
            'uuid',
          ] as OpenportalUnmanagedProjectsListData['query']['field']),
        o: options.o || ['name'],
        ...options, // Spread additional options like customer_uuid
      },
    });

    return returnReactSelectAsyncPaginateObject(
      parseSelectData(response),
      prevOptions,
      currentPage,
    );
  } catch {
    // Return empty result on error to prevent component from breaking
    return {
      options: prevOptions || [],
      hasMore: false,
    };
  }
};

// Main component with improvements
export const ProjectAutocompleteField: FunctionComponent<
  ProjectAutocompleteProps
> = ({
  input,
  placeholder,
  query = {}, // Provide default empty object
  noOptionsMessage,
  reactSelectProps = {}, // Provide default empty object
  debounceMs = 300, // Reduced default debounce time for better UX
}) => {
  // Create a stable query options object to prevent unnecessary re-renders
  const queryOptions = useMemo(
    () =>
      ({
        field: ['name', 'uuid'],
        o: ['name'],
        ...query,
      }) satisfies Partial<OpenportalUnmanagedProjectsListData['query']>,
    [query],
  );

  // Memoize the debounced function with query as dependency
  const debouncedAutocomplete = useMemo(
    () =>
      debounce(
        async (
          searchQuery: string,
          prevOptions,
          page: number,
          options: Partial<OpenportalUnmanagedProjectsListData['query']>,
          resolve: (result: any) => void,
        ) => {
          try {
            const result = await unmanagedProjectAutocomplete(
              searchQuery,
              prevOptions,
              page,
              options,
            );
            resolve(result);
          } catch {
            resolve({ options: prevOptions || [], hasMore: false });
          }
        },
        debounceMs,
      ),
    [debounceMs, queryOptions], // Include queryOptions as dependency
  );

  const loadOptions = useCallback(
    (searchQuery: string, prevOptions, { page }: { page: number }) => {
      return new Promise<{
        options;
        hasMore: boolean;
        additional?: { page: number };
      }>((resolve) => {
        debouncedAutocomplete(
          searchQuery,
          prevOptions,
          page,
          queryOptions,
          resolve,
        );
      });
    },
    [debouncedAutocomplete, queryOptions],
  );

  // Memoize handlers to prevent unnecessary re-renders
  const handleChange = useCallback(
    (value) => {
      input.onChange(value);
    },
    [input],
  );

  const getNoOptionsMessage = useCallback(
    () => noOptionsMessage || translate('No projects found'),
    [noOptionsMessage],
  );

  return (
    <AsyncPaginate
      placeholder={placeholder || translate('Select project...')}
      loadOptions={loadOptions}
      defaultOptions
      getOptionValue={(option) => option.uuid}
      getOptionLabel={(option) => option.name}
      value={input.value}
      onChange={handleChange}
      onBlur={input.onBlur}
      noOptionsMessage={getNoOptionsMessage}
      isClearable={true}
      {...reactSelectProps}
    />
  );
};
