import {
  InfiniteData,
  keepPreviousData,
  QueryFunction,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { useRouter } from '@uirouter/react';
import { useCombobox } from 'downshift';
import { debounce } from 'lodash-es';
import { ReactNode, useEffect, useId, useMemo, useRef, useState } from 'react';

import { translate } from '@/i18n';
import { DataPage, processApiResponse, SdkFunction } from '@/table/api';

import { BaseAsyncListProps, RowData } from './types';

/** A row of an async combobox: the page it opens. */
export interface ComboboxLinkItem {
  to: string;
  params?: { [key: string]: string };
}

/** A row as the combobox holds it: its unique value and option id besides. */
export type ComboboxRow<Item extends ComboboxLinkItem> = Item & {
  value: string;
  id: string;
};

interface UseAsyncComboboxOptions<
  Fetcher extends SdkFunction,
  Item extends ComboboxLinkItem,
> extends BaseAsyncListProps<Fetcher> {
  /** What a row of the results links to and shows. */
  getItem: (row: RowData<Fetcher>) => Item;
  /** The option's text, for downshift. */
  itemToString: (item: Item) => string;
  /** Query values besides the search (a dropdown's filters). */
  filterValues?: Record<string, unknown>;
  /**
   * Whether the list shows. Left out, it always does (a combobox inside a
   * popover of its own); given, downshift asks to change it through
   * onIsOpenChange: typing, a click on the box and ArrowDown open it, Escape,
   * Tab and a click elsewhere close it.
   */
  isOpen?: boolean;
  onIsOpenChange?: (isOpen: boolean) => void;
  /**
   * Called once a row is opened: by Enter, which navigates here, or by a
   * click, which its link handles.
   */
  onOpenItem?: (item: Item) => void;
  debounceMs?: number;
}

/** A row's unique value: the page it links to. */
const getItemValue = ({ to, params }: ComboboxLinkItem) =>
  `${to}:${JSON.stringify(params ?? {})}`;

/**
 * A downshift combobox over a backend search: focus stays in the search box
 * while the arrow keys move a highlight through the rows (options of a
 * listbox, pointed at with aria-activedescendant) and Enter opens one. The
 * backend filters, so downshift doesn't; results come a page at a time, the
 * next one when the sentinel after the rows scrolls into view.
 *
 * Headless: BreadcrumbDropdown and AsyncSearchBox draw it.
 */
export const useAsyncCombobox = <
  Fetcher extends SdkFunction,
  Item extends ComboboxLinkItem,
>({
  fetcher,
  queryKey,
  queryField,
  path,
  params = {},
  filterValues,
  getItem,
  itemToString,
  emptyMessage = translate('There are no results for this keyword.'),
  isOpen: isOpenProp,
  onIsOpenChange,
  onOpenItem,
  debounceMs = 300,
}: UseAsyncComboboxOptions<Fetcher, Item>) => {
  const alwaysOpen = isOpenProp === undefined;
  const isOpen = alwaysOpen || isOpenProp;
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  // The ids the combobox points at: the listbox's and each option's.
  const idPrefix = useId();
  const listboxId = `${idPrefix}-listbox`;

  const applyQuery = useMemo(
    () => debounce((value: string) => setQuery(value.trim()), debounceMs),
    [debounceMs],
  );
  useEffect(() => () => applyQuery.cancel(), [applyQuery]);

  type TypedPage = DataPage<RowData<Fetcher>>;

  const queryFn: QueryFunction<TypedPage, unknown[], number> = async ({
    pageParam = 1,
    signal,
  }) => {
    const result = await fetcher({
      query: {
        page: pageParam,
        ...params,
        ...filterValues,
        [queryField]: query,
      },
      path,
      signal,
    });
    return processApiResponse(result);
  };

  const context = useInfiniteQuery<TypedPage, Error, InfiniteData<TypedPage>>({
    queryKey: [
      'SearchBoxResults',
      queryKey,
      path,
      params,
      query,
      filterValues ?? {},
    ],
    queryFn,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    // Nothing is fetched until the list first shows.
    enabled: isOpen,
    refetchOnWindowFocus: false,
    throwOnError: false,
    retry: false,
    // A new search keeps the current rows until its results arrive, so the
    // list stays mounted and the highlight stays on a row still there
    // (targetIndex below moves it to the first row when that one is gone).
    placeholderData: keepPreviousData,
  });

  const rows: ComboboxRow<Item>[] = useMemo(
    () =>
      (context.data?.pages.flatMap((page) => page.rows) ?? []).map(
        (row, index) => {
          const item = getItem(row);
          return {
            ...item,
            value: getItemValue(item),
            id: `${idPrefix}-option-${index}`,
          };
        },
      ),
    [context.data, getItem, idPrefix],
  );

  // Track the highlighted row's key so that when search results change, the
  // highlight stays on the row if still present, or falls back to the first.
  const [highlightedKey, setHighlightedKey] = useState('');

  const targetIndex = useMemo(() => {
    if (rows.length === 0) return -1;
    const foundIndex = rows.findIndex((it) => it.value === highlightedKey);
    return foundIndex !== -1 ? foundIndex : 0;
  }, [rows, highlightedKey]);

  // No highlight until there are rows: it would point at no option.
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  useEffect(() => {
    setHighlightedIndex(targetIndex);
  }, [targetIndex]);

  // The next page loads when the sentinel after the rows scrolls into view.
  // A callback ref: the list may mount later than this hook (in a popover).
  const [sentinel, setSentinel] = useState<HTMLElement | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = context;

  // The keyboard pages too: downshift scrolls only the highlighted row into
  // view, so ArrowDown on the last row never reveals the sentinel. It loads
  // the next page instead, and the highlight moves on to the first new row
  // once it arrives.
  const advanceFromKey = useRef<string | null>(null);

  const loadMoreFromLastRow = () => {
    const last = rows[rows.length - 1];
    if (!last || highlightedIndex !== rows.length - 1 || !hasNextPage) {
      return;
    }
    advanceFromKey.current = last.value;
    if (!isFetchingNextPage) fetchNextPage();
  };

  useEffect(() => {
    const key = advanceFromKey.current;
    if (!key) return;
    const index = rows.findIndex((row) => row.value === key);
    if (index !== -1 && index < rows.length - 1) {
      advanceFromKey.current = null;
      setHighlightedKey(rows[index + 1].value);
    } else if (index === -1 || (!isFetchingNextPage && !hasNextPage)) {
      // A new search replaced the rows, or there was nothing more after all.
      advanceFromKey.current = null;
    }
  }, [rows, isFetchingNextPage, hasNextPage]);

  const combobox = useCombobox({
    items: rows,
    isOpen,
    highlightedIndex,
    inputValue: search,
    // An action, not a choice: nothing stays selected, so opening the same
    // row again still reports it.
    selectedItem: null,
    menuId: listboxId,
    getItemId: (index) => `${idPrefix}-option-${index}`,
    itemToString: (item) => (item ? itemToString(item) : ''),
    getA11yStatusMessage: () => '',
    onIsOpenChange: ({ isOpen: nextIsOpen }) => {
      if (!alwaysOpen) onIsOpenChange?.(Boolean(nextIsOpen));
    },
    onHighlightedIndexChange: ({ highlightedIndex: nextIndex }) => {
      if (
        typeof nextIndex === 'number' &&
        nextIndex >= 0 &&
        nextIndex < rows.length
      ) {
        setHighlightedIndex(nextIndex);
        setHighlightedKey(rows[nextIndex]?.value ?? '');
      }
    },
    onSelectedItemChange: ({ selectedItem, type }) => {
      if (!selectedItem) return;
      // A click opens the row through its link; Enter navigates here.
      if (type === useCombobox.stateChangeTypes.InputKeyDownEnter) {
        router.stateService.go(selectedItem.to, selectedItem.params);
      }
      onOpenItem?.(selectedItem);
    },
    stateReducer: (state, { type, changes }) => {
      switch (type) {
        case useCombobox.stateChangeTypes.InputKeyDownArrowUp:
          // No wrapping: ArrowUp on the first row stays there.
          return state.highlightedIndex === 0
            ? { ...changes, highlightedIndex: 0 }
            : changes;
        case useCombobox.stateChangeTypes.InputKeyDownArrowDown:
          // No wrapping: ArrowDown on the last row stays there.
          return state.highlightedIndex === rows.length - 1
            ? { ...changes, highlightedIndex: rows.length - 1 }
            : changes;
        case useCombobox.stateChangeTypes.InputClick:
          // A click on the box opens the list; it never toggles it shut.
          return { ...changes, isOpen: true };
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          // Opening a row closes the list, unless it always shows.
          return { ...changes, isOpen: alwaysOpen };
        case useCombobox.stateChangeTypes.InputKeyDownEscape:
          return alwaysOpen ? { ...changes, isOpen: true } : changes;
        case useCombobox.stateChangeTypes.InputBlur:
          // Leaving the box (Tab, a click elsewhere) opens nothing: downshift
          // would select the highlighted row.
          return {
            ...changes,
            selectedItem: state.selectedItem,
            inputValue: state.inputValue,
            isOpen: alwaysOpen || changes.isOpen,
          };
        default:
          return changes;
      }
    },
  });

  /** Reports a change of the search box's text. */
  const changeSearch = (value: string) => {
    setSearch(value);
    applyQuery(value);
  };

  useEffect(() => {
    if (
      typeof IntersectionObserver === 'undefined' ||
      !sentinel ||
      !hasNextPage
    ) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: menuRef.current },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinel, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const resultCount = context.data?.pages[0]?.resultCount;
  /** What the status region announces: what the search found. */
  const status: string =
    context.status === 'pending'
      ? ''
      : context.status === 'error'
        ? translate('Error')
        : rows.length === 0
          ? typeof emptyMessage === 'string'
            ? emptyMessage
            : ''
          : isFetchingNextPage
            ? translate('Loading more...')
            : context.isPlaceholderData
              ? ''
              : query
                ? translate('Results: {count}', {
                    count: resultCount ?? rows.length,
                  })
                : '';

  const getInputProps: typeof combobox.getInputProps = (options, ...rest) =>
    combobox.getInputProps(
      {
        ...options,
        onKeyDown: (event) => {
          options?.onKeyDown?.(event);
          if (event.key === 'ArrowDown') loadMoreFromLastRow();
        },
      },
      ...rest,
    );

  return {
    ...combobox,
    getInputProps,
    isOpen,
    search,
    changeSearch,
    query,
    context,
    rows,
    highlightedIndex,
    menuRef,
    sentinelRef: setSentinel,
    status,
    emptyMessage: emptyMessage as ReactNode,
  };
};
