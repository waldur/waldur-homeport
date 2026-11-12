import classNames from 'classnames';

import { useTableContext } from '../../context';
import { TableBody } from '../../TableBody';
import { TableHeader } from '../../TableHeader';

/**
 * Renders the table element with header and body.
 * This component reads from context and passes props to the existing
 * TableHeader and TableBody components for backward compatibility.
 *
 * @internal
 */
export function TableView() {
  const {
    rows,
    visibleColumns,
    config,
    actions,
    sorting,
    selectedRows,
    toggled,
    pinnedColumns,
    pinnedOffsets,
    columnPositions,
    filtersStorage,
    display,
    fieldType,
    fieldName,
    validate,
    slots,
  } = useTableContext();

  // Determine if actions column should be visible
  const showActions = Boolean(slots.rowActions);

  return (
    <table
      className={classNames(
        'w-full border-collapse align-middle text-sm text-primary border-secondary mb-0',
        config.fullWidth &&
          '[--table-edge-px:var(--card-padding-x)] max-sm:[--table-edge-px:15px]',
        fieldName && 'cursor-pointer',
        config.hoverable &&
          '[&_tbody>tr[data-slot=table-row]:not([data-state]):hover]:[--table-row-bg:var(--bg-tertiary)]',
      )}
    >
      {config.hasHeaders && (
        <TableHeader
          rows={rows}
          rowKey={config.rowKey}
          onSortClick={actions.sortList}
          currentSorting={sorting}
          columns={visibleColumns}
          expandableRow={Boolean(slots.expandableRow)}
          hideExpandToggle={config.hideExpandToggle}
          showActions={showActions}
          enableMultiSelect={config.enableMultiSelect}
          onSelectAllRows={actions.selectAllRows}
          selectedRows={selectedRows}
          toggleRow={actions.toggleRow}
          toggled={toggled}
          fieldType={fieldType}
          filters={slots.filters}
          filtersStorage={filtersStorage}
          setFilter={actions.setFilter}
          applyFiltersFn={actions.applyFiltersFn}
          columnPositions={columnPositions}
          hasOptionalColumns={config.hasOptionalColumns}
          toggleFilterMenu={actions.toggleFilterMenu}
          pinnedColumns={pinnedColumns}
          pinnedOffsets={pinnedOffsets}
          toggleColumnPin={actions.toggleColumnPin}
          equalColWidth={config.equalColWidth}
        />
      )}
      <TableBody
        rows={rows}
        columns={visibleColumns}
        rowClass={display.rowClass}
        rowVariant={display.rowVariant}
        rowValidate={display.rowValidate}
        rowGroupHeader={display.rowGroupHeader}
        rowKey={config.rowKey}
        expandableRow={slots.expandableRow}
        isRowExpandable={config.isRowExpandable}
        expandableRowClassName={display.expandableRowClassName}
        rowActions={slots.rowActions}
        onRowClick={actions.onRowClick}
        enableMultiSelect={config.enableMultiSelect}
        selectRow={actions.selectRow}
        selectedRows={selectedRows}
        toggleRow={actions.toggleRow}
        toggled={toggled}
        fetch={actions.fetch}
        fieldType={fieldType}
        fieldName={fieldName}
        validate={validate}
        columnPositions={columnPositions}
        hasOptionalColumns={config.hasOptionalColumns}
        pinnedColumns={pinnedColumns}
        pinnedOffsets={pinnedOffsets}
        fullWidth={config.fullWidth}
      />
    </table>
  );
}
