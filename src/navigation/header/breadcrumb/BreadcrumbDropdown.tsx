import { FunnelSimpleIcon } from '@phosphor-icons/react';
import {
  InfiniteData,
  keepPreviousData,
  QueryFunction,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { useRouter } from '@uirouter/react';
import { useCombobox } from 'downshift';
import { debounce, isEqual } from 'lodash-es';
import {
  KeyboardEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Field, Form, useFormState } from 'react-final-form';
import { useBoolean } from 'react-use';

import { BaseButton } from 'waldur-ui';

import { BaseAsyncListProps, RowData } from '@/core/async/types';
import { isEmpty } from '@/core/utils';
import { FilterBox } from '@/form/FilterBox';
import { translate } from '@/i18n';
import { useOrganizationAndProjectAutocompletesForResources } from '@/navigation/sidebar/resources-filter/utils';
import { DataPage, processApiResponse, SdkFunction } from '@/table/api';

import { useFavoritePages } from '../favorite-pages/FavoritePageService';
import { HeaderButtonBullet } from '../HeaderButtonBullet';
import { getResourceFilterFromSearchItem } from '../search/utils';

import { BreadcrumbItem, BreadcrumbSearchItem } from './BreadcrumbSearchItem';
import { FilterSelect } from './FilterSelect';

interface BreadcrumbDropdownProps<Fetcher extends SdkFunction> extends Omit<
  BaseAsyncListProps<Fetcher>,
  'RowComponent'
> {
  /** What a row of the results links to and shows. */
  getItem: (row: RowData<Fetcher>) => BreadcrumbItem;
  filters?: Array<{
    field: string;
    label: string;
    options: Array<{ value; label }>;
  }>;
  /** Callback to close the dropdown popover */
  close?: () => void;
}

// As SearchInput.tsx names its own shortcut.
const FAVORITE_SHORTCUT =
  typeof navigator !== 'undefined' &&
  /Mac|iPhone|iPad|iPod/.test(navigator.platform)
    ? '⌘D'
    : 'Ctrl+D';

/** A row's unique value: the page it links to. */
const getItemValue = ({ to, params }: BreadcrumbItem) =>
  `${to}:${JSON.stringify(params ?? {})}`;

const BreadcrumbDropdownContent = <Fetcher extends SdkFunction>({
  fetcher,
  queryKey,
  queryField,
  getItem,
  path,
  params = {},
  filters,
  emptyMessage = translate('There are no results for this keyword.'),
  placeholder = translate('Search'),
  close,
}: BreadcrumbDropdownProps<Fetcher>) => {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [favoriteMessage, setFavoriteMessage] = useState('');
  const hintId = useId();
  // The ids the combobox points at: the listbox's and each option's.
  const idPrefix = useId();
  const listboxId = `${idPrefix}-listbox`;
  const { addFavoritePage, removeFavorite, isFavorite } = useFavoritePages();
  const router = useRouter();
  const { syncResourceFilters } =
    useOrganizationAndProjectAutocompletesForResources();
  const [filterOpen, setFilterOpen] = useBoolean(false);

  // Get raw form values from React Final Form
  const { values: rawFormValues } = useFormState();

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
    }, 300),
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
    // A new search keeps the current rows until its results arrive, so the
    // list stays mounted and the highlight stays on a row still there
    // (activeValue below moves it to the first row when that one is gone).
    placeholderData: keepPreviousData,
  });

  const rows = useMemo(
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

  // Track the highlighted item's key so that when search results change,
  // the highlight stays on the row if still present, or falls back to the
  // first result.
  const [highlightedKey, setHighlightedKey] = useState<string>('');

  const targetIndex = useMemo(() => {
    if (rows.length === 0) return -1;
    const foundIndex = rows.findIndex((it) => it.value === highlightedKey);
    return foundIndex !== -1 ? foundIndex : 0;
  }, [rows, highlightedKey]);

  const [highlightedIndex, setHighlightedIndex] = useState(0);

  useEffect(() => {
    if (rows.length === 0) {
      setHighlightedIndex(-1);
    } else {
      setHighlightedIndex(targetIndex);
    }
  }, [targetIndex, rows.length]);

  /** Opens a row; Enter navigates here, a click through the row's link. */
  const openItem = (item: BreadcrumbItem, navigate: boolean) => {
    if (navigate) {
      router.stateService.go(item.to, item.params);
    }
    syncResourceFilters(getResourceFilterFromSearchItem(item));
    close?.();
  };

  /** Adds a row to the favourites or removes it; returns what to announce. */
  const toggleFavorite = (item: BreadcrumbItem, event?: MouseEvent) => {
    if (isFavorite(item.to, item.params)) {
      removeFavorite(item.to, item.params, event);
      return translate('Removed from favourites');
    }
    addFavoritePage(
      {
        state: item.to,
        params: item.params,
        title: item.title,
        subtitle: item.subtitle,
        image: item.image,
      },
      event,
    );
    return translate('Added to favourites');
  };

  // Ctrl/Cmd+D adds the highlighted row to the favourites or removes it: the
  // row's star is for the pointer only (BreadcrumbSearchItem).
  const toggleHighlightedFavorite = (
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key.toLowerCase() !== 'd' || !(event.ctrlKey || event.metaKey)) {
      return;
    }
    const currentItem = rows[highlightedIndex];
    if (!currentItem) return;
    event.preventDefault();
    setFavoriteMessage(toggleFavorite(currentItem));
  };

  const { getInputProps, getMenuProps, getItemProps } = useCombobox({
    items: rows,
    isOpen: true,
    highlightedIndex,
    menuId: listboxId,
    getItemId: (index) => `${idPrefix}-option-${index}`,
    itemToString: (item) => {
      if (!item) return '';
      return `${item.title} ${item.subtitle || ''}`.trim();
    },
    getA11yStatusMessage: () => '',
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
      openItem(
        selectedItem,
        type === useCombobox.stateChangeTypes.InputKeyDownEnter,
      );
    },
    stateReducer: (state, actionAndChanges) => {
      const { type, changes } = actionAndChanges;
      switch (type) {
        case useCombobox.stateChangeTypes.InputKeyDownArrowUp:
          // No wrapping: ArrowUp on the first row stays there.
          if (state.highlightedIndex === 0) {
            return { ...changes, highlightedIndex: 0 };
          }
          return changes;
        case useCombobox.stateChangeTypes.InputKeyDownArrowDown:
          // No wrapping: ArrowDown on the last item stays there.
          if (state.highlightedIndex === rows.length - 1) {
            return { ...changes, highlightedIndex: rows.length - 1 };
          }
          return changes;
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          return {
            ...changes,
            inputValue: state.inputValue, // preserve the search input
          };
        case useCombobox.stateChangeTypes.InputKeyDownEscape:
          return {
            ...changes,
            isOpen: true,
          };
        default:
          return changes;
      }
    },
  });

  const sentinelRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      typeof IntersectionObserver === 'undefined' ||
      !sentinelRef.current ||
      !context.hasNextPage
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          context.hasNextPage &&
          !context.isFetchingNextPage
        ) {
          context.fetchNextPage();
        }
      },
      {
        root: menuRef.current,
        rootMargin: '0px',
      },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [context.hasNextPage, context.isFetchingNextPage, context.fetchNextPage]);

  const resultCount = context.data?.pages[0]?.resultCount;
  const status =
    context.status === 'pending'
      ? ''
      : context.status === 'error'
        ? translate('Error')
        : rows.length === 0
          ? typeof emptyMessage === 'string'
            ? emptyMessage
            : ''
          : context.isPlaceholderData
            ? ''
            : query
              ? translate('Results: {count}', {
                  count: resultCount ?? rows.length,
                })
              : '';

  return (
    // A combobox: focus stays in the search box while the arrow keys move
    // the highlight through the rows (options) and Enter opens one. The
    // backend filters, so downshift doesn't filter locally.
    <div>
      <div className="d-flex border-bottom py-2 pe-3">
        <FilterBox
          {...getInputProps({
            type: 'search',
            'aria-label': placeholder,
            autoComplete: 'off',
            spellCheck: false,
            placeholder,
            value: search,
            onChange: (event: any) => {
              setSearch(event.target.value);
              setFavoriteMessage('');
              applyQuery(event.target.value);
            },
            onKeyDown: (event: any) => {
              toggleHighlightedFavorite(event);
            },
            'aria-describedby': hintId,
            preventEnterSubmit: false,
            inputClassName: 'border-0 shadow-none',
            className: 'flex-grow-1',
            autoFocus: true,
          })}
        />
        <span id={hintId} className="sr-only">
          {translate(
            'Press {shortcut} to add the highlighted item to favourites or remove it.',
            { shortcut: FAVORITE_SHORTCUT },
          )}
        </span>

        {Boolean(filters) && (
          <div className="position-relative">
            <BaseButton
              iconNode={<FunnelSimpleIcon weight="bold" />}
              tooltip={translate('Toggle filters')}
              variant="tertiary"
              className="btn-toggle-filters"
              onClick={setFilterOpen}
              size="lg"
            />
            {!isEmpty(formValues) && (
              <HeaderButtonBullet size={8} blink={false} className="me-n2" />
            )}
          </div>
        )}
      </div>
      {filterOpen && (
        <div className="d-flex border-bottom py-1 px-5">
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
        </div>
      )}
      <div
        {...getMenuProps({
          ref: menuRef,
          'aria-label': translate('Search results'),
          className: 'mh-300px overflow-auto',
        })}
      >
        {context.status === 'pending' ? (
          <div role="progressbar" aria-label={translate('Loading')}>
            <p className="text-center text-dark mb-0">{translate('Loading')}</p>
          </div>
        ) : context.status === 'error' ? (
          <p className="text-center text-dark mb-0">{translate('Error')}</p>
        ) : rows.length === 0 ? (
          typeof emptyMessage === 'string' ? (
            <p className="text-center text-dark mb-0">{emptyMessage}</p>
          ) : (
            emptyMessage
          )
        ) : (
          <>
            <div className="timeline">
              {rows.map((item, index) => (
                <BreadcrumbSearchItem
                  key={item.value}
                  item={item}
                  favorite={Boolean(isFavorite(item.to, item.params))}
                  highlighted={highlightedIndex === index}
                  onToggleFavorite={(event) => toggleFavorite(item, event)}
                  itemProps={getItemProps({
                    item,
                    index,
                  })}
                />
              ))}
            </div>
            {context.hasNextPage && (
              <div
                ref={sentinelRef}
                className="text-center py-2 text-muted fs-7"
              >
                {context.isFetchingNextPage
                  ? translate('Loading more...')
                  : null}
              </div>
            )}
            <div>
              {context.isFetching && !context.isFetchingNextPage
                ? translate('Fetching...')
                : null}
            </div>
          </>
        )}
      </div>
      {/* Announces what the search found, and a favourite toggled from the
          keyboard. */}
      <div role="status" className="sr-only">
        {favoriteMessage || status}
      </div>
    </div>
  );
};

export const BreadcrumbDropdown = <Fetcher extends SdkFunction>(
  props: BreadcrumbDropdownProps<Fetcher>,
): JSX.Element => (
  <Form
    onSubmit={() => {}}
    render={({ handleSubmit }) => (
      <form onSubmit={handleSubmit}>
        <BreadcrumbDropdownContent {...props} />
      </form>
    )}
  />
);
