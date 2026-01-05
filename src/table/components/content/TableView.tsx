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
        'table align-middle table-row-bordered fs-6 gy-0 gx-8px no-footer',
        {
          'table-expandable': Boolean(slots.expandableRow),
          'table-hover': config.hoverable,
        },
      )}
    >
      {config.hasHeaders && (
        <TableHeader
          rows={rows}
          onSortClick={actions.sortList}
          currentSorting={sorting}
          columns={visibleColumns}
          expandableRow={Boolean(slots.expandableRow)}
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
          equalColWidth={config.equalColWidth}
        />
      )}
      <TableBody
        rows={rows}
        columns={visibleColumns}
        rowClass={display.rowClass}
        rowKey={config.rowKey}
        expandableRow={slots.expandableRow}
        expandableRowClassName={display.expandableRowClassName}
        rowActions={slots.rowActions}
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
      />
    </table>
  );
}
