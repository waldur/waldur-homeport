import { fetchResultCount } from '@/core/api';
import { ENV } from '@/core/config';

import { AsyncSelectLoader } from './types';

/**
 * Utility type to extract the `query` parameters type from an SDK list method.
 * It infers the `query` type from the function signature and removes nullability.
 * This ensures we can pass type-safe `extraQuery` parameters to the fetcher.
 */
type GetQuery<T> = T extends (options?: { query?: infer Q }) => any
  ? NonNullable<Q>
  : any;

/**
 * Utility type to extract the `path` parameters type from an SDK list method.
 * It infers the `path` type from the function signature and removes nullability.
 * This ensures we can pass type-safe `pathParams` to the fetcher if the endpoint requires them.
 */
type GetPath<T> = T extends (options?: { path?: infer P }) => any
  ? NonNullable<P>
  : any;

/**
 * Utility type to extract the return type of a single item from an SDK list method.
 * It infers the type `O` from the array returned in the `data` field of the Promise.
 * It also explicitly omits the `options` key from the resulting object,
 * as React Select internally reserves the `options` property, and leaving it
 * on the entity can cause infinite loops or rendering errors in the dropdown.
 */
type GetOptionType<T> = T extends (
  options: any,
) => Promise<{ data: Array<infer O> }>
  ? Omit<O, 'options'>
  : any;

/**
 * Builds a robust entity loader (fetcher) compatible with `react-select-async-paginate`.
 *
 * This factory abstracts the boilerplate required for paginated API requests, including:
 * 1. Injecting `page` and `page_size` pagination parameters.
 * 2. Mapping the user's string input to the correct API search field.
 * 3. Stripping out the `options` key from API responses to prevent React Select bugs.
 * 4. Calculating the `hasMore` boolean to tell the dropdown whether to load the next page.
 * 5. Catching network errors to prevent infinite pagination loops.
 *
 * @template T - The SDK list function signature.
 *
 * @param listMethod - The SDK client method to invoke (e.g. `projectsList`).
 * @param searchField - The API query parameter used for search filtering.
 *                      The list endpoints in waldur-mastermind don't share a single
 *                      filter contract — some accept `query` (full-text), most accept `name`,
 *                      and a few accept neither. Pass `searchField` per endpoint so we send
 *                      only what that endpoint actually accepts. On `'none'`, the search box
 *                      just narrows the default-ordered list manually via local filtering.
 * @param extraQuery - Static query parameters to attach to every request (e.g. `{ o: 'name' }`).
 *                     It is strictly typed against the SDK endpoint's query schema.
 * @param pathParams - Static path parameters to attach to every request (e.g. `{ uuid: '123' }`).
 *                     It is strictly typed against the SDK endpoint's path schema.
 *
 * @returns An async function compatible with the `loadOptions` prop of `react-select-async-paginate`.
 *          It resolves to an object containing `options`, `hasMore`, and `additional.page`.
 */
export const createLoadOptions = <
  T extends (options: { query?: any; path?: any }) => Promise<any>,
>(
  listMethod: T,
  searchField?: keyof GetQuery<T> | 'none',
  extraQuery: Partial<GetQuery<T>> = {},
  pathParams: Partial<GetPath<T>> = {},
) => {
  const fetcher: AsyncSelectLoader<GetOptionType<T>> = async (
    query: string,
    prevOptions: any,
    additional: any,
  ) => {
    const page = typeof additional === 'object' ? additional.page : additional;
    const params = {
      page: page,
      page_size: ENV.pageSize,
      ...extraQuery,
    } as any;
    if (query && searchField && searchField !== 'none') {
      params[searchField] = query;
    }

    try {
      const response = await listMethod({
        path: pathParams,
        query: params,
      });

      if (!response) {
        return {
          options: [],
          hasMore: false,
          additional: { page },
        };
      }

      if (response.error) {
        throw response.error;
      }

      const options = response.data
        ? response.data.map(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ({ options: _, ...rest }: any) => rest,
          )
        : [];

      const totalItems = fetchResultCount(response);
      if (typeof totalItems !== 'number' || !Number.isFinite(totalItems)) {
        return {
          options,
          hasMore: false,
          additional: { page: page + 1 },
        };
      }

      return {
        options,
        hasMore: totalItems > prevOptions.length + ENV.pageSize,
        additional: {
          page: page + 1,
        },
      };
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      // Network/auth error → stop paginating so we don't loop forever.
      return {
        options: prevOptions,
        hasMore: false,
        additional: { page },
      };
    }
  };
  return fetcher;
};
