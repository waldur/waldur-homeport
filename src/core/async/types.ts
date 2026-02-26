import { ComponentType } from 'react';

import { SdkFunction } from '@waldur/table/api';

/**
 * Extracts the type of a single item from the data array
 * returned by an SDK fetcher function.
 *
 * @example
 * // If fetcher returns Promise<{ data: User[] }>,
 * // RowData<typeof fetcher> will be User.
 */
export type RowData<Fetcher extends SdkFunction> = Awaited<
  ReturnType<Fetcher>
>['data'][number];

/**
 * Extracts the valid params for the 'query' parameter of a fetcher function.
 */
type QueryParams<Fetcher extends SdkFunction> = Parameters<Fetcher>[0]['query'];

/**
 * Base props for any component that displays an asynchronous, searchable list.
 */
export interface BaseAsyncListProps<Fetcher extends SdkFunction> {
  /** The SDK function used to fetch data. */
  fetcher: Fetcher;
  /** A unique key for react-query to cache the results. */
  queryKey: string;
  /** The component used to render a single row of data. */
  RowComponent: ComponentType<{ row: RowData<Fetcher> }>;
  /** The field in the API query used for text-based searching (e.g., 'name', 'query'). */
  queryField: keyof QueryParams<Fetcher>;
  /** Additional static query parameters to send with every request. */
  params?: QueryParams<Fetcher>;
  /** The message to display when there are no results. */
  emptyMessage?: string;
  /** The placeholder text for the search input. */
  placeholder?: string;
  path?: Parameters<Fetcher>[0]['path'];
}
