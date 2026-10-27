import { FunnelSimpleIcon } from '@phosphor-icons/react';
import { isEqual } from 'es-toolkit';
import {
  KeyboardEvent,
  MouseEvent,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Field, Form, useFormState } from 'react-final-form';
import { useBoolean } from 'react-use';

import { BaseButton } from 'waldur-ui';

import { BaseAsyncListProps, RowData } from '@/core/async/types';
import { useAsyncCombobox } from '@/core/async/useAsyncCombobox';
import { isEmpty } from '@/core/utils';
import { FilterBox } from '@/form/FilterBox';
import { translate } from '@/i18n';
import { useOrganizationAndProjectAutocompletesForResources } from '@/navigation/sidebar/resources-filter/utils';
import { SdkFunction } from '@/table/api';

import { useFavoritePages } from '../favorite-pages/FavoritePageService';
import { HeaderButtonBullet } from '../HeaderButtonBullet';
import { getResourceFilterFromSearchItem } from '../search/utils';

import { BreadcrumbItem, BreadcrumbSearchItem } from './BreadcrumbSearchItem';
import { FilterSelect } from './FilterSelect';

interface BreadcrumbDropdownProps<
  Fetcher extends SdkFunction,
> extends BaseAsyncListProps<Fetcher> {
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

const itemToString = (item: BreadcrumbItem) =>
  `${item.title} ${item.subtitle || ''}`.trim();

const BreadcrumbDropdownContent = <Fetcher extends SdkFunction>({
  getItem,
  filters,
  emptyMessage = translate('There are no results for this keyword.'),
  placeholder = translate('Search'),
  close,
  ...listProps
}: BreadcrumbDropdownProps<Fetcher>) => {
  const [favoriteMessage, setFavoriteMessage] = useState('');
  const hintId = useId();
  const { addFavoritePage, removeFavorite, isFavorite } = useFavoritePages();
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

  const {
    context,
    rows,
    search,
    changeSearch,
    highlightedIndex,
    getInputProps,
    getMenuProps,
    getItemProps,
    menuRef,
    sentinelRef,
    status,
  } = useAsyncCombobox({
    ...listProps,
    filterValues: formValues,
    getItem,
    itemToString,
    emptyMessage,
    onOpenItem: (item) => {
      syncResourceFilters(getResourceFilterFromSearchItem(item));
      close?.();
    },
  });

  /** Adds a row to the favourites or removes it; returns what to announce. */
  const toggleFavorite = (item: BreadcrumbItem, event?: MouseEvent) => {
    if (isFavorite(item.to, item.params)) {
      removeFavorite(item.to, item.params, event);
      return translate('Removed from favorites');
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
    return translate('Added to favorites');
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

  return (
    // A combobox: focus stays in the search box while the arrow keys move
    // the highlight through the rows (options) and Enter opens one. The
    // backend filters, so downshift doesn't filter locally.
    <div>
      <div className="flex border-b-[1px] border-b-secondary py-1.5 pe-2.5">
        <FilterBox
          {...getInputProps({
            type: 'search',
            'aria-label': placeholder,
            autoComplete: 'off',
            spellCheck: false,
            placeholder,
            value: search,
            onChange: (event: any) => {
              changeSearch(event.target.value);
              setFavoriteMessage('');
            },
            onKeyDown: (event: any) => {
              toggleHighlightedFavorite(event);
            },
            'aria-describedby': hintId,
            preventEnterSubmit: false,
            inputClassName: 'border-0 shadow-none',
            className: 'grow',
            autoFocus: true,
          })}
        />
        <span id={hintId} className="sr-only">
          {translate(
            'Press {shortcut} to add the highlighted item to favorites or remove it.',
            { shortcut: FAVORITE_SHORTCUT },
          )}
        </span>

        {Boolean(filters) && (
          <div className="position-relative">
            <BaseButton
              iconNode={<FunnelSimpleIcon weight="bold" />}
              tooltip={translate('Toggle filters')}
              variant="tertiary"
              onClick={setFilterOpen}
              size="lg"
            />
            {!isEmpty(formValues) && (
              <HeaderButtonBullet size={8} blink={false} className="-me-1.5" />
            )}
          </div>
        )}
      </div>
      {filterOpen && (
        <div className="flex border-b-[1px] border-b-secondary py-1 px-4">
          {filters.map((filter) => (
            // `component` must keep its identity across renders: an inline
            // function is a new component type each time, so every re-render
            // (focusing the select is one) remounts it and closes its menu.
            <Field
              key={filter.field}
              name={filter.field}
              component={FilterSelect}
              placeholder={filter.label}
              options={filter.options}
            />
          ))}
        </div>
      )}
      <div
        {...getMenuProps({
          ref: menuRef,
          'aria-label': translate('Search results'),
          className: 'max-h-[300px] overflow-auto',
        })}
      >
        {context.status === 'pending' ? (
          <div role="progressbar" aria-label={translate('Loading')}>
            <p className="text-center text-primary m-0">
              {translate('Loading')}
            </p>
          </div>
        ) : context.status === 'error' ? (
          <p className="text-center text-primary m-0">{translate('Error')}</p>
        ) : rows.length === 0 ? (
          typeof emptyMessage === 'string' ? (
            <p className="text-center text-primary m-0">{emptyMessage}</p>
          ) : (
            emptyMessage
          )
        ) : (
          <>
            <div>
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
                className="text-center py-1.5 text-quaternary text-xs"
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
