import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowsDownUpIcon,
} from '@phosphor-icons/react';
import { FC, useMemo, useState } from 'react';

import { SkeletonLoader } from '@waldur/ai-assistant/components/shared/SkeletonLoader';
import { UIBlockProps } from '@waldur/ai-assistant/lib/types';
import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';
import { StateIndicator } from '@waldur/core/StateIndicator';
import { FilterBox } from '@waldur/form/FilterBox';
import { translate } from '@waldur/i18n';

type SortDirection = 'asc' | 'desc' | null;

// Get state variant based on state value
const getStateVariant = (
  state: string,
): 'success' | 'danger' | 'warning' | 'default' => {
  const upperState = state.toUpperCase();
  if (['OK', 'ACTIVE', 'RUNNING'].includes(upperState)) return 'success';
  if (['ERRED', 'ERROR', 'FAILED'].includes(upperState)) return 'danger';
  if (['TERMINATED', 'STOPPED', 'SHUTOFF'].includes(upperState))
    return 'warning';
  return 'default';
};

// Check if state is active (in progress)
const isStateActive = (state: string): boolean => {
  return ['Creating', 'Updating', 'Terminating'].some((s) =>
    state.toLowerCase().includes(s.toLowerCase()),
  );
};

/**
 * TableBlock component for displaying AI assistant tool results in a table format.
 *
 * @note This component uses a custom table implementation instead of the Waldur Table component.
 * The Waldur Table's built-in features overlapped and conflicted
 * with the AI assistant's table toolbar and functionality, causing rendering issues and crashes.
 * The custom implementation provides better control and prevents component conflicts.
 */
export const TableBlock: FC<UIBlockProps> = ({ block }) => {
  const isLoading = block.status === 'loading';
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [filterText, setFilterText] = useState('');

  const tableData = useMemo(() => {
    // Use structured data from block if available
    if (block.headers && block.rows) {
      return {
        headers: block.headers,
        rows: block.rows,
        alignments: block.headers.map(() => 'left' as const),
      };
    }
  }, [block.headers, block.rows]);

  const handleSort = (columnIndex: number) => {
    if (sortColumn === columnIndex) {
      // Cycle through: asc -> desc -> none
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(columnIndex);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedRows = useMemo(() => {
    if (!tableData) return [];

    let rows = [...tableData.rows];

    // Apply filter
    if (filterText) {
      const lowerFilter = filterText.toLowerCase();
      rows = rows.filter((row) =>
        row.some((cell) => cell.toLowerCase().includes(lowerFilter)),
      );
    }

    // Apply sort
    if (sortColumn !== null && sortDirection) {
      rows.sort((a, b) => {
        const aVal = a[sortColumn] || '';
        const bVal = b[sortColumn] || '';
        const comparison = aVal.localeCompare(bVal, undefined, {
          numeric: true,
          sensitivity: 'base',
        });
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return rows;
  }, [tableData, filterText, sortColumn, sortDirection]);

  if (isLoading) {
    return (
      <div className="aui-table-block">
        <div className="aui-table-toolbar">
          <div className="aui-table-toolbar-left">
            <span className="aui-table-count">{translate('Loading...')}</span>
          </div>
        </div>
        <SkeletonLoader />
      </div>
    );
  }

  if (!tableData) {
    return (
      <div className="aui-table-block">
        <div className="aui-table-error">
          {translate('Invalid table format')}
        </div>
      </div>
    );
  }

  const getSortIcon = (columnIndex: number) => {
    if (sortColumn !== columnIndex) {
      return <ArrowsDownUpIcon size={14} weight="bold" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUpIcon size={14} weight="bold" />
    ) : (
      <ArrowDownIcon size={14} weight="bold" />
    );
  };

  const displayCount = block.totalCount ?? filteredAndSortedRows.length;

  // Render cell with special formatting based on column header
  const renderCell = (cell: string, columnHeader: string) => {
    const header = columnHeader.toLowerCase();

    // State column - show colored badge
    if (header === 'state') {
      return (
        <StateIndicator
          label={cell}
          variant={getStateVariant(cell)}
          active={isStateActive(cell)}
          pill
          outline
        />
      );
    }

    // Name column - show text + copy button
    if (header === 'name') {
      return (
        <div className="d-flex align-items-center gap-1">
          <span className="fw-semibold">{cell}</span>
          <CopyToClipboardButton
            value={cell}
            className="text-hover-primary cursor-pointer"
          />
        </div>
      );
    }

    // Default - just return the cell value
    return cell;
  };

  return (
    <div className="aui-table-block">
      <div className="aui-table-toolbar">
        <div className="aui-table-toolbar-left">
          <span className="aui-table-count">
            {displayCount}{' '}
            {displayCount === 1
              ? translate('resource')
              : translate('resources')}
          </span>
        </div>
        <div className="aui-table-toolbar-right">
          <FilterBox
            placeholder={translate('Search...')}
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
      </div>
      <div className="table-responsive">
        <table className="table align-middle table-row-bordered table-hover fs-6 gy-0 gx-8px">
          <thead>
            <tr>
              {tableData.headers.map((header, index) => (
                <th
                  key={index}
                  className="sorting-column"
                  onClick={() => handleSort(index)}
                >
                  <div className="d-flex align-items-center justify-content-between">
                    <span>{header}</span>
                    <span className="sorting-icon">{getSortIcon(index)}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedRows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>
                    {renderCell(cell, tableData.headers[cellIndex])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
