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
import { DotsSixVertical, Gear } from '@phosphor-icons/react';
import { FC, useMemo, useState } from 'react';
import { Button, Dropdown, OverlayTrigger, Popover } from 'react-bootstrap';

import { FilterBox } from '@waldur/form/FilterBox';
import { translate } from '@waldur/i18n';

import CheckboxIcon from './Checkbox.svg';
import CheckboxEmptyIcon from './CheckboxEmpty.svg';
import { OPTIONAL_COLUMN_ACTIONS_KEY } from './constants';
import { TableProps } from './Table';

const SortableItem = (props) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      className="dropdown-item"
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <span className="svg-icon svg-icon-2 svg-icon-white me-3">
        <DotsSixVertical size={32} />
      </span>{' '}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <span
        className="svg-icon svg-icon-2 svg-icon-white me-3"
        onClick={props.onClick}
      >
        {props.isActive ? <CheckboxIcon /> : <CheckboxEmptyIcon />}
      </span>
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
    <div className="border mw-400px">
      <div className="p-5">
        <FilterBox
          type="search"
          placeholder={translate('Search') + '...'}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="mh-300px overflow-auto">
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
          <Dropdown.Item
            onClick={() => toggleColumn(OPTIONAL_COLUMN_ACTIONS_KEY)}
          >
            <span className="svg-icon svg-icon-2 svg-icon-white me-3">
              {activeColumns[OPTIONAL_COLUMN_ACTIONS_KEY] ? (
                <CheckboxIcon />
              ) : (
                <CheckboxEmptyIcon />
              )}
            </span>
            {translate('Actions')}
          </Dropdown.Item>
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
  hoverableRow,
}) => (
  <OverlayTrigger
    trigger="click"
    placement="bottom"
    overlay={
      <Popover id="TableColumnButton">
        <ColumnsPopover
          columns={columns}
          activeColumns={activeColumns}
          toggleColumn={toggleColumn}
          swapColumns={swapColumns}
          columnPositions={columnPositions}
          hasActions={Boolean(hoverableRow)}
        />
      </Popover>
    }
    rootClose
  >
    <Button variant="outline-default" className="btn-outline btn-icon">
      <span className="svg-icon svg-icon-1">
        <Gear weight="bold" />
      </span>
    </Button>
  </OverlayTrigger>
);
