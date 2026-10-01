import {
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
import * as RadixPopover from '@radix-ui/react-popover';
import { FC, useMemo, useState } from 'react';
import { FormCheck } from 'react-bootstrap';

import { BaseButton } from 'waldur-ui';

import { FilterBox } from '@/form/FilterBox';
import { translate } from '@/i18n';

import { COLUMN_ACTIONS_KEY } from './constants';
import { TableProps } from './types';

const SortableItem = (props) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      className="dropdown-item d-flex align-items-center"
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <span className="svg-icon svg-icon-4 svg-icon-gray">
        <DotsSixVerticalIcon weight="bold" />
      </span>
      <FormCheck
        className="form-check form-check-custom form-check-sm min-h-auto svg-icon"
        checked={props.isActive}
        onChange={props.onClick}
      />
      {props.title}
    </div>
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

    if (active.id !== over.id) {
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

  return (
    <div className="mw-400px">
      <div className="p-5">
        <FilterBox
          type="search"
          placeholder={translate('Search...')}
          onChange={(e) => setQuery(e.target.value)}
          rightAction={
            <BaseButton
              iconNode={<ArrowCounterClockwiseIcon weight="bold" />}
              tooltip={translate('Reset settings to default')}
              onClick={resetColumns}
              variant="text-secondary"
              size="sm"
            />
          }
        />
      </div>
      <div className="mh-300px overflow-auto pb-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={matches}
            strategy={verticalListSortingStrategy}
          >
            {matches.map((id) => (
              <SortableItem
                key={id}
                id={id}
                title={columnMap[id].title}
                onClick={() => toggleColumn(id, columnMap[id])}
                isActive={activeColumns[id]}
              />
            ))}
          </SortableContext>
        </DndContext>

        {hasActions && (
          <button
            type="button"
            onClick={() =>
              toggleColumn(COLUMN_ACTIONS_KEY, { keys: [COLUMN_ACTIONS_KEY] })
            }
            className="dropdown-item d-flex align-items-center"
          >
            <FormCheck
              key={activeColumns[COLUMN_ACTIONS_KEY]}
              className="form-check form-check-custom form-check-sm min-h-auto svg-icon"
              checked={activeColumns[COLUMN_ACTIONS_KEY]}
              onChange={(e) => e.preventDefault()}
            />
            {translate('Actions')}
          </button>
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
    <RadixPopover.Root modal={false}>
      {/* BaseButton's own `tooltip` prop wraps the button in its own
          Tooltip internally — Radix's nested asChild composition delivers
          Popover's props down to the underlying <button>. */}
      <RadixPopover.Trigger asChild disabled={mode !== 'table'}>
        <BaseButton
          disabled={mode !== 'table'}
          variant="tertiary"
          size="lg"
          tooltip={translate('Toggle visible columns')}
          iconNode={<GearIcon weight="bold" />}
        />
      </RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          side="bottom"
          align="end"
          sideOffset={2}
          className="table-columns-popover rounded-md border border-[var(--surface-card-border)] bg-[var(--surface-card-bg)] shadow-[var(--dropdown-shadow)] text-[var(--surface-text-primary)] outline-hidden"
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
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
};
