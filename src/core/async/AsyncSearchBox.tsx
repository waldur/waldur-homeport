import * as RadixPopover from '@radix-ui/react-popover';
import {
  InfiniteData,
  QueryFunction,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { debounce } from 'lodash-es';
import { useCallback, useState } from 'react';

import { FilterBox } from '@/form/FilterBox';
import { translate } from '@/i18n';
import { DataPage, processApiResponse, SdkFunction } from '@/table/api';

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
  const [query, setQuery] = useState('');

  const applyQuery = useCallback(
    debounce((value) => {
      setQuery(String(value).trim());
    }, 1000),
    [setQuery],
  );

  const [open, setOpen] = useState(false);

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
    // Mirrors `open`, not a separately-driven flag: this popover uses
    // `Popover.Anchor`, not `Popover.Trigger`, so it opens via direct
    // `setOpen(true)` calls from the search input's own onFocus/onChange
    // below, never through Radix's own interaction handling — Anchor has
    // none. `onOpenChange` only fires for changes Radix itself initiates
    // (Trigger clicks, Escape, outside-click), so a query gated on a
    // separate `enabled` state set inside `onOpenChange` never actually
    // turned on: reported live as the search dropdown showing "Loading"
    // forever, because no request was ever sent (React Query v5 has no
    // `idle` status — a permanently-disabled query reports `pending`,
    // rendering the same as a real in-flight one, indistinguishable in
    // the UI). Enabling directly off `open` removes the indirection.
    enabled: open,
  });

  return (
    <div id="search-box-wrapper" className={wrapperClassName}>
      <RadixPopover.Root open={open} onOpenChange={setOpen} modal={false}>
        <RadixPopover.Anchor asChild>
          <div aria-hidden="true">
            <FilterBox
              type="search"
              placeholder={placeholder}
              onFocus={() => setOpen(true)}
              onChange={(e) => {
                applyQuery(e.target.value);
                setOpen(true);
              }}
              className={className}
            />
          </div>
        </RadixPopover.Anchor>
        <RadixPopover.Portal>
          <RadixPopover.Content
            // Keeps focus in the search input instead of Radix's default
            // of moving it into the panel on open — the user is mid-typing.
            onOpenAutoFocus={(e) => e.preventDefault()}
            side="bottom"
            align="start"
            sideOffset={2}
            // data-popper-placement isn't decorative: core's own
            // .menu-sub-dropdown.show[data-popper-placement] rule
            // (core/components/menu/_base.scss) gates display:flex behind
            // its mere presence — see NavMenu.tsx's own top-of-file
            // comment for the full reasoning, which applies identically
            // here since this reuses the same Metronic menu classes.
            data-popper-placement="bottom"
            className="search-results-dropdown menu menu-sub menu-sub-dropdown show menu-column border mw-400px mh-300px py-2"
          >
            <div className="overflow-auto">
              <InfiniteList
                RowComponent={RowComponent}
                context={context}
                emptyMessage={emptyMessage}
              />
            </div>
          </RadixPopover.Content>
        </RadixPopover.Portal>
      </RadixPopover.Root>
    </div>
  );
};
