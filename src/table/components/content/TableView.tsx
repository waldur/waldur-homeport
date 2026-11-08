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
        'table align-middle table-row-bordered text-sm table-list mb-0',
        config.fullWidth &&
          '[&_td:first-child]:ps-[var(--card-padding-x)] [&_th:first-child]:ps-[var(--card-padding-x)] [&_td:last-child]:pe-[var(--card-padding-x)] [&_th:last-child]:pe-[var(--card-padding-x)] max-sm:[&_td:first-child]:!ps-[15px] max-sm:[&_th:first-child]:!ps-[15px] max-sm:[&_td:last-child]:!pe-[15px] max-sm:[&_th:last-child]:!pe-[15px]',
        fieldName &&
          'cursor-pointer [&_tr.checked]:!bg-secondary [&_tr.checked_>*]:!bg-secondary [&_tr.checked_>*]:border-0',
        {
          'table-expandable': Boolean(slots.expandableRow),
          'table-hover': config.hoverable,
        },
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
      />
    </table>
  );
}
