import {
  Announcements,
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowCounterClockwiseIcon,
  DotsSixVerticalIcon,
  GearIcon,
} from '@phosphor-icons/react';
import { FC, ReactNode, useId, useMemo, useState } from 'react';

import {
  BaseButton,
  Checkbox,
  Popover,
  PopoverContent,
  PopoverTrigger,
  cn,
  menuItem,
} from 'waldur-ui';

import { FilterBox } from '@/form/FilterBox';
import { translate } from '@/i18n';

import { COLUMN_ACTIONS_KEY } from './constants';
import { TableProps } from './types';

interface SortableItemProps {
  id: string;
  title: ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const SortableItem: FC<SortableItemProps> = ({
  id,
  title,
  isActive,
  onClick,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const checkboxId = useId();
  const labelText = typeof title === 'string' ? title : id;

  return (
    <li
      className={cn(menuItem({ look: 'actions' }), isDragging && 'opacity-50')}
      data-testid="column-row"
      ref={setNodeRef}
      style={style}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className="inline-flex items-center justify-center size-[20px] shrink-0 p-0 me-[12px] cursor-grab active:cursor-grabbing border-0 bg-transparent text-gray-500 hover:text-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary rounded"
        aria-label={translate('Reorder column {title}', { title: labelText })}
      >
        <DotsSixVerticalIcon weight="bold" size={16} />
      </button>
      <label
        htmlFor={checkboxId}
        className="d-flex align-items-center flex-grow-1 cursor-pointer m-0"
      >
        <Checkbox
          id={checkboxId}
          size="sm"
          className="me-[12px]"
          checked={Boolean(isActive)}
          onChange={onClick}
          aria-label={typeof title === 'string' ? title : undefined}
        />
        <span>{title}</span>
      </label>
    </li>
  );
};

const ColumnsPopover = ({
  columns,
  toggleColumn,
  activeColumns,
  swapColumns,
  columnPositions,
  hasActions,
  resetColumns,
}) => {
  const [query, setQuery] = useState('');
  const actionsCheckboxId = useId();

  const columnMap = useMemo(
    () =>
      columns.reduce(
        (result, column) => ({ ...result, [column.id]: column }),
        {},
      ),
    [columns],
  );

  const matches = useMemo(
    () =>
      columnPositions.filter(
        (id) =>
          (columnMap[id].keys && !query) ||
          typeof columnMap[id].title !== 'string' ||
          columnMap[id].title.toLowerCase().includes(query.toLowerCase()),
      ),
    [columnMap, query],
  );

  function handleDragEnd(event) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      swapColumns(active.id, over.id);
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const announcements: Announcements = useMemo(
    () => ({
      onDragStart({ active }) {
        const title = columnMap[active.id]?.title ?? active.id;
        return translate(
          'Picked up column {title}. Use arrow keys to reorder, space to drop.',
          { title },
        );
      },
      onDragOver({ active, over }) {
        if (over) {
          const title = columnMap[active.id]?.title ?? active.id;
          const overIndex = matches.indexOf(String(over.id)) + 1;
          return translate(
            'Column {title} was moved over position {position} of {total}.',
            { title, position: overIndex, total: matches.length },
          );
        }
      },
      onDragEnd({ active, over }) {
        const title = columnMap[active.id]?.title ?? active.id;
        if (over) {
          const overIndex = matches.indexOf(String(over.id)) + 1;
          return translate(
            'Column {title} was dropped at position {position} of {total}.',
            { title, position: overIndex, total: matches.length },
          );
        }
        return translate('Column {title} was dropped.', { title });
      },
      onDragCancel({ active }) {
        const title = columnMap[active.id]?.title ?? active.id;
        return translate(
          'Reordering was cancelled. Column {title} returned to its original position.',
          { title },
        );
      },
    }),
    [columnMap, matches],
  );

  return (
    <div className="mw-400px">
      <div className="p-5">
        <FilterBox
          type="search"
          placeholder={translate('Search...')}
          aria-label={translate('Search columns')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rightAction={
            <BaseButton
              iconNode={<ArrowCounterClockwiseIcon weight="bold" />}
              tooltip={translate('Reset settings to default')}
              aria-label={translate('Reset settings to default')}
              onClick={resetColumns}
              variant="text-secondary"
              size="sm"
            />
          }
        />
      </div>
      <div role="status" className="sr-only">
        {query
          ? translate('Columns found: {count}', { count: matches.length })
          : ''}
      </div>
      <div className="mh-300px overflow-auto pb-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          accessibility={{
            announcements,
          }}
        >
          <SortableContext
            items={matches}
            strategy={verticalListSortingStrategy}
          >
            <ul
              className="list-unstyled p-0 m-0"
              aria-label={translate('Columns')}
            >
              {matches.map((id) => (
                <SortableItem
                  key={id}
                  id={id}
                  title={columnMap[id].title}
                  onClick={() => toggleColumn(id, columnMap[id])}
                  isActive={Boolean(activeColumns[id])}
                />
              ))}
              {hasActions && (
                <li
                  data-testid="column-row"
                  className={menuItem({ look: 'actions' })}
                >
                  <span
                    className="d-inline-block size-[20px] shrink-0 me-[12px] opacity-0"
                    aria-hidden="true"
                  />
                  <label
                    htmlFor={actionsCheckboxId}
                    className="d-flex align-items-center flex-grow-1 cursor-pointer m-0"
                  >
                    <Checkbox
                      id={actionsCheckboxId}
                      key={activeColumns[COLUMN_ACTIONS_KEY]}
                      size="sm"
                      className="me-[12px]"
                      checked={Boolean(activeColumns[COLUMN_ACTIONS_KEY])}
                      onChange={() =>
                        toggleColumn(COLUMN_ACTIONS_KEY, {
                          keys: [COLUMN_ACTIONS_KEY],
                        })
                      }
                      aria-label={translate('Actions')}
                    />
                    <span>{translate('Actions')}</span>
                  </label>
                </li>
              )}
            </ul>
          </SortableContext>
        </DndContext>

        {matches.length === 0 && (
          <div className="text-muted text-center py-4 fs-7">
            {translate('No columns found')}
          </div>
        )}
      </div>
    </div>
  );
};

export const TableColumnButton: FC<TableProps> = ({
  columns,
  activeColumns,
  toggleColumn,
  swapColumns,
  columnPositions,
  initColumnPositions,
  resetColumns,
  rowActions,
  mode,
}) => {
  const handleReset = () => {
    resetColumns();
    initColumnPositions(columns.map((column) => column.id));
    // Re-run the same initialization Table.tsx uses on mount:
    // column.optional === true → hidden by default; otherwise → visible.
    columns.forEach((column) => {
      toggleColumn(column.id, column, column.optional ? false : true);
    });
    if (rowActions) {
      toggleColumn(COLUMN_ACTIONS_KEY, { keys: [] }, true);
    }
  };
  return (
    <Popover>
      {/* BaseButton's own `tooltip` prop wraps the button in its own
          Tooltip internally — Radix's nested asChild composition delivers
          Popover's props down to the underlying <button>. */}
      <PopoverTrigger asChild disabled={mode !== 'table'}>
        <BaseButton
          disabled={mode !== 'table'}
          variant="tertiary"
          size="lg"
          tooltip={translate('Toggle visible columns')}
          iconNode={<GearIcon weight="bold" />}
        />
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={2}
        className="table-columns-popover"
        aria-label={translate('Visible columns')}
      >
        <ColumnsPopover
          columns={columns}
          activeColumns={activeColumns}
          toggleColumn={toggleColumn}
          swapColumns={swapColumns}
          columnPositions={columnPositions}
          hasActions={Boolean(rowActions)}
          resetColumns={handleReset}
        />
      </PopoverContent>
    </Popover>
  );
};
