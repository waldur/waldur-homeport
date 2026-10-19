import { useCombobox } from 'downshift';
import {
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ModalBody,
  ModalHeader,
  Tabs,
  TabsList,
  TabsTrigger,
  useModalHide,
} from 'waldur-ui';

import { FilterBox } from '@/form/FilterBox';
import { translate } from '@/i18n';
import { ModalService } from '@/modal/actions';
import { ModalContext } from '@/modal/ModalContext';
import { NoResult } from '@/navigation/header/search/NoResult';

import {
  ActionComboboxContext,
  ComboboxActionItem,
} from './ActionComboboxContext';
import { ActionGroupTabsContext } from './ActionGroup';
import { ActionList } from './ActionList';

// The All tab's value. Not a group title, so it cannot collide with one.
const ALL_GROUPS = '__all__';

export const ActionDialogBody: FC<PropsWithChildren> = ({ children }) => {
  const [query, setQuery] = useState('');
  const [groups, setGroups] = useState<string[]>([]);
  const [activeGroup, setActiveGroup] = useState(ALL_GROUPS);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const itemsMapRef = useRef<Map<string, ComboboxActionItem>>(new Map());
  const [items, setItems] = useState<ComboboxActionItem[]>([]);
  const idPrefix = useId();
  const listboxId = `${idPrefix}-actions-listbox`;
  const hintId = `${idPrefix}-search-hint`;
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const modalHide = useModalHide();
  const modalContext = useContext(ModalContext);

  const close = useCallback(() => {
    if (modalHide) {
      modalHide();
    } else if (modalContext?.closeDialog) {
      modalContext.closeDialog();
    } else {
      ModalService.close();
    }
  }, [modalHide, modalContext]);

  const syncScheduledRef = useRef(false);

  const scheduleSync = useCallback(() => {
    if (syncScheduledRef.current) return;
    syncScheduledRef.current = true;
    queueMicrotask(() => {
      syncScheduledRef.current = false;
      const currentItems = Array.from(itemsMapRef.current.values());
      currentItems.sort((a, b) => {
        if (!a.element || !b.element) return 0;
        if (a.element === b.element) return 0;
        const position = a.element.compareDocumentPosition(b.element);
        if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
        if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
        return 0;
      });
      setItems((prev) => {
        if (
          prev.length === currentItems.length &&
          prev.every(
            (it, idx) =>
              it.id === currentItems[idx].id &&
              it.disabled === currentItems[idx].disabled &&
              it.label === currentItems[idx].label &&
              it.action === currentItems[idx].action &&
              it.element === currentItems[idx].element,
          )
        ) {
          return prev;
        }
        return currentItems;
      });
    });
  }, []);

  const registerItem = useCallback(
    (item: ComboboxActionItem) => {
      itemsMapRef.current.set(item.id, item);
      scheduleSync();
      return () => {
        itemsMapRef.current.delete(item.id);
        scheduleSync();
      };
    },
    [scheduleSync],
  );

  useEffect(() => {
    if (items.length === 0) {
      setHighlightedIndex(-1);
    } else {
      setHighlightedIndex((prev) =>
        prev >= 0 && prev < items.length ? prev : 0,
      );
    }
  }, [items]);

  const { getInputProps, getMenuProps, getItemProps } =
    useCombobox<ComboboxActionItem>({
      items,
      isOpen: true,
      highlightedIndex,
      menuId: listboxId,
      getItemId: (index) => `${idPrefix}-action-${index}`,
      itemToString: (item) => item?.label ?? '',
      onHighlightedIndexChange: ({ highlightedIndex: nextIndex }) => {
        if (typeof nextIndex === 'number') {
          setHighlightedIndex(nextIndex);
        }
      },
      onSelectedItemChange: ({ selectedItem, type }) => {
        if (!selectedItem || selectedItem.disabled) return;
        if (type === useCombobox.stateChangeTypes.InputKeyDownEnter) {
          selectedItem.action();
        }
      },
      stateReducer: (state, actionAndChanges) => {
        const { type, changes } = actionAndChanges;
        switch (type) {
          case useCombobox.stateChangeTypes.InputKeyDownArrowDown:
            if (state.highlightedIndex === items.length - 1) {
              return { ...changes, highlightedIndex: items.length - 1 };
            }
            return changes;
          case useCombobox.stateChangeTypes.InputKeyDownArrowUp:
            if (state.highlightedIndex === 0) {
              return { ...changes, highlightedIndex: 0 };
            }
            return changes;
          case useCombobox.stateChangeTypes.InputKeyDownEnter:
          case useCombobox.stateChangeTypes.ItemClick:
            return {
              ...changes,
              inputValue: state.inputValue,
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

  const contextValue = useMemo(
    () => ({
      registerItem,
      highlightedIndex,
      items,
      getItemProps,
    }),
    [registerItem, highlightedIndex, items, getItemProps],
  );

  const registerGroup = useCallback((title: string) => {
    setGroups((prev) => (prev.includes(title) ? prev : [...prev, title]));
  }, []);

  // The dialog opens on All: it is reached through "Show all", and opening
  // it on one group would hide most of what the user asked to see. A search
  // spans every group, so while there is one the bar shows All rather than
  // highlight a tab that is not being applied; clearing the search brings
  // the picked tab back.
  const effectiveGroup = query ? ALL_GROUPS : activeGroup;

  const tabsValue = useMemo(
    () => ({
      activeGroup: effectiveGroup === ALL_GROUPS ? undefined : effectiveGroup,
      registerGroup,
    }),
    [effectiveGroup, registerGroup],
  );

  const noMatch = Boolean(query) && items.length === 0;
  const clearSearch = () => {
    setQuery('');
    setHighlightedIndex(0);
    inputRef.current?.focus();
  };

  return (
    <ActionComboboxContext.Provider value={contextValue}>
      <ModalHeader className="flex-wrap pb-[12px]">
        <FilterBox
          {...getInputProps({
            ref: inputRef,
            type: 'search',
            placeholder: translate('Search'),
            'aria-label': translate('Search actions'),
            'aria-describedby': hintId,
            value: query,
            onChange: (e: any) => {
              setQuery(e.target.value);
              setHighlightedIndex(0);
            },
            onKeyDown: (e: any) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                close();
              }
            },
            autoFocus: true,
            className: 'w-full grow',
            preventEnterSubmit: false,
          })}
        />
        <span id={hintId} className="sr-only">
          {translate(
            'Use arrow keys to navigate matching actions and press Enter to select.',
          )}
        </span>
        {groups.length > 1 && (
          <Tabs
            value={effectiveGroup}
            onValueChange={setActiveGroup}
            className="w-full mt-4"
          >
            {/* Wraps rather than scrolls: a clipped last tab reads as a broken
                label, and nothing tells the user the strip scrolls. */}
            <TabsList aria-label={translate('Action groups')}>
              <TabsTrigger value={ALL_GROUPS}>{translate('All')}</TabsTrigger>
              {groups.map((group) => (
                <TabsTrigger key={group} value={group}>
                  {group}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
      </ModalHeader>
      <ModalBody
        {...getMenuProps({
          ref: listRef,
          className: 'h-[400px] overflow-auto px-0 pt-0',
          'aria-label': translate('Actions'),
        })}
      >
        {/* Tells a screen reader how many actions the search leaves. */}
        <div role="status" className="sr-only">
          {query
            ? translate('Actions found: {count}', { count: items.length })
            : ''}
        </div>
        <div className={noMatch ? 'hidden' : undefined}>
          <ActionGroupTabsContext.Provider value={tabsValue}>
            <ActionList query={query}>{children}</ActionList>
          </ActionGroupTabsContext.Provider>
        </div>
        {noMatch && (
          <NoResult
            title={translate('No actions found')}
            message={translate('No action matches "{query}".', { query })}
            callback={clearSearch}
          />
        )}
      </ModalBody>
    </ActionComboboxContext.Provider>
  );
};
