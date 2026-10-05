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
import { Modal } from 'react-bootstrap';
import BootstrapModalContext from 'react-bootstrap/ModalContext';

import { FilterBox } from '@/form/FilterBox';
import { translate } from '@/i18n';
import { ModalService } from '@/modal/actions';
import { ModalContext } from '@/modal/ModalContext';
import { NoResult } from '@/navigation/header/search/NoResult';

import {
  ActionComboboxContext,
  ComboboxActionItem,
} from './ActionComboboxContext';
import { ActionList } from './ActionList';

export const ActionDialogBody: FC<PropsWithChildren> = ({ children }) => {
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const itemsMapRef = useRef<Map<string, ComboboxActionItem>>(new Map());
  const [items, setItems] = useState<ComboboxActionItem[]>([]);
  const idPrefix = useId();
  const listboxId = `${idPrefix}-actions-listbox`;
  const hintId = `${idPrefix}-search-hint`;
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const bootstrapModal = useContext(BootstrapModalContext);
  const modalContext = useContext(ModalContext);

  const close = useCallback(() => {
    if (bootstrapModal?.onHide) {
      bootstrapModal.onHide();
    } else if (modalContext?.closeDialog) {
      modalContext.closeDialog();
    } else {
      ModalService.close();
    }
  }, [bootstrapModal, modalContext]);

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

  const noMatch = Boolean(query) && items.length === 0;
  const clearSearch = () => {
    setQuery('');
    setHighlightedIndex(0);
    inputRef.current?.focus();
  };

  return (
    <ActionComboboxContext.Provider value={contextValue}>
      <Modal.Header className="without-border pb-4">
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
            className: 'w-100 flex-grow-1',
            preventEnterSubmit: false,
          })}
        />
        <span id={hintId} className="sr-only">
          {translate(
            'Use arrow keys to navigate matching actions and press Enter to select.',
          )}
        </span>
      </Modal.Header>
      <Modal.Body
        {...getMenuProps({
          ref: listRef,
          className: 'pt-0 px-0 h-400px overflow-auto',
          'aria-label': translate('Actions'),
        })}
      >
        {/* Tells a screen reader how many actions the search leaves. */}
        <div role="status" className="sr-only">
          {query
            ? translate('Actions found: {count}', { count: items.length })
            : ''}
        </div>
        <div className={noMatch ? 'd-none' : undefined}>
          <ActionList query={query}>{children}</ActionList>
        </div>
        {noMatch && (
          <NoResult
            title={translate('No actions found')}
            message={translate('No action matches "{query}".', { query })}
            callback={clearSearch}
          />
        )}
      </Modal.Body>
    </ActionComboboxContext.Provider>
  );
};
