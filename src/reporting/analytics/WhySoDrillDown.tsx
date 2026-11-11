import {
  CaretDownIcon,
  TrendDownIcon,
  TrendUpIcon,
} from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, useCallback, useMemo, useState } from 'react';

import {
  Badge,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { CaretUpDownButtons } from '@/core/CaretUpDownButtons';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';

import { DrillDownDataItem } from './types';

interface WhySoDrillDownProps {
  /** Initial data at root level */
  initialData: DrillDownDataItem[];
  /** Initial dimension label */
  initialDimension: string;
  /** Function to fetch data for next drill-down level */
  onDrillDown: (
    item: DrillDownDataItem,
    currentDimension: string,
  ) => Promise<{ data: DrillDownDataItem[]; dimension: string } | null>;
  /** Custom label for the 'Value' column */
  valueLabel?: string | ((total: number) => string);
  /** Title for the analysis */
  title?: string;
}

const DrillDownChange: FC<{ change?: DrillDownDataItem['change'] }> = ({
  change,
}) => {
  if (!change) {
    return <span className="text-quaternary">—</span>;
  }

  const changeDirection = change.direction;

  return (
    <Badge
      variant={
        changeDirection === 'up'
          ? 'danger'
          : changeDirection === 'down'
            ? 'success'
            : 'secondary'
      }
      leftIcon={
        <>
          {changeDirection === 'up' && <TrendUpIcon weight="bold" />}
          {changeDirection === 'down' && <TrendDownIcon weight="bold" />}
        </>
      }
      shape="pill"
      tone="outline"
      className={classNames(
        'inline-flex items-center gap-1',
        changeDirection === 'stable' && 'text-quaternary',
      )}
    >
      {change.percent > 0 ? '+' : ''}
      {change.percent.toFixed(1)}%
    </Badge>
  );
};

/**
 * Single row in the drill-down table
 */
const DrillDownRow: FC<{
  item: DrillDownDataItem;
  dimension: string;
  onDrillDown: WhySoDrillDownProps['onDrillDown'];
  showChange?: boolean;
  valueLabel?: WhySoDrillDownProps['valueLabel'];
}> = ({ item, dimension, onDrillDown, showChange, valueLabel }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [childData, setChildData] = useState<DrillDownDataItem[] | null>(null);
  const [childDimension, setChildDimension] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleExpand = useCallback(async () => {
    if (!item.canDrillDown) return;

    if (!isExpanded && !childData && !isLoading) {
      setIsLoading(true);
      setError(null);
      try {
        const result = await onDrillDown(item, dimension);
        if (result) {
          setChildData(result.data);
          setChildDimension(result.dimension);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : translate('Failed to load data'),
        );
      } finally {
        setIsLoading(false);
      }
    }
    setIsExpanded(!isExpanded);
  }, [item, dimension, onDrillDown, isExpanded, childData, isLoading]);

  return (
    <>
      <TableRow
        hoverable={false}
        className={classNames(
          item.canDrillDown && 'cursor-pointer hover:bg-secondary',
          isExpanded && 'bg-tertiary dark:bg-quaternary',
        )}
        onClick={toggleExpand}
      >
        <TableCell className="flex items-center gap-1.5">
          <div className="flex justify-center w-5">
            {item.canDrillDown && (
              <CaretDownIcon
                weight="bold"
                className={classNames(
                  'transition-[rotate] duration-200 ease-[ease]',
                  !isExpanded && '-rotate-90',
                )}
              />
            )}
          </div>
          <span className={item.canDrillDown ? '' : ''}>
            {item.renderLabel ? item.renderLabel(item) : item.label}
          </span>
        </TableCell>
        <TableCell className="text-end">
          <span>{item.value.toLocaleString()}</span>
        </TableCell>
        <TableCell className="text-end w-[100px]">
          <span className="text-quaternary">{item.percentage.toFixed(1)}%</span>
        </TableCell>
        {showChange && (
          <TableCell className="text-end w-[100px]">
            <DrillDownChange change={item.change} />
          </TableCell>
        )}
      </TableRow>
      {isExpanded && (
        <TableRow hoverable={false} divided={false}>
          <TableCell colSpan={showChange ? 4 : 3} className="p-0 border-0">
            <div className="ps-4 pt-0 pb-2.5 pe-3">
              {isLoading ? (
                <div className="py-3 text-center">
                  <LoadingSpinner />
                </div>
              ) : error ? (
                <div className="py-1.5">
                  <LoadingErred message={error} loadData={toggleExpand} />
                </div>
              ) : childData && childDimension ? (
                <WhySoDrillDownTable
                  data={childData}
                  dimension={childDimension}
                  onDrillDown={onDrillDown}
                  valueLabel={valueLabel}
                />
              ) : (
                <div className="py-1.5">
                  <NoResult
                    title={translate('No details available')}
                    message={translate('No further breakdown for this item.')}
                    noAction
                  />
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

const WhySoDrillDownTable: FC<{
  data: DrillDownDataItem[];
  dimension: string;
  onDrillDown: WhySoDrillDownProps['onDrillDown'];
  isRoot?: boolean;
  valueLabel?: WhySoDrillDownProps['valueLabel'];
}> = ({ data, dimension, onDrillDown, isRoot, valueLabel }) => {
  const [sortColumn, setSortColumn] = useState<
    'label' | 'value' | 'share' | 'change'
  >('value');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const hasChanges = useMemo(() => data.some((item) => item.change), [data]);
  const totalValue = useMemo(
    () => data.reduce((sum, item) => sum + item.value, 0),
    [data],
  );

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let valA: any;
      let valB: any;

      if (sortColumn === 'label') {
        valA = a.label;
        valB = b.label;
      } else if (sortColumn === 'value') {
        valA = a.value;
        valB = b.value;
      } else if (sortColumn === 'share') {
        valA = a.percentage;
        valB = b.percentage;
      } else if (sortColumn === 'change') {
        valA =
          a.change?.percent ?? (sortOrder === 'asc' ? Infinity : -Infinity);
        valB =
          b.change?.percent ?? (sortOrder === 'asc' ? Infinity : -Infinity);
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortColumn, sortOrder]);

  const toggleSort = (column: typeof sortColumn) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('desc');
    }
  };

  const resolvedValueLabel = useMemo(() => {
    if (typeof valueLabel === 'function') {
      return valueLabel(totalValue);
    }
    return valueLabel || translate('Value');
  }, [valueLabel, totalValue]);

  const HeaderSort = ({ column }: { column: typeof sortColumn }) => {
    return (
      <CaretUpDownButtons
        onClickUp={() => {
          setSortColumn(column);
          setSortOrder('asc');
        }}
        onClickDown={() => {
          setSortColumn(column);
          setSortOrder('desc');
        }}
        upClassName={classNames(
          sortColumn === column && sortOrder === 'asc' && 'text-brand',
        )}
        downClassName={classNames(
          sortColumn === column && sortOrder === 'desc' && 'text-brand',
        )}
        upLabel={translate('Sort ascending')}
        downLabel={translate('Sort descending')}
        className="ms-1"
      />
    );
  };

  return (
    <div className="py-2.5">
      <div>
        <Table
          scrollable={Boolean(isRoot)}
          className={classNames(
            'border border-secondary mb-0',
            !isRoot && 'text-xs',
          )}
        >
          <TableHeader>
            <TableRow className="text-quaternary text-xs uppercase font-medium border-b border-b-secondary">
              <TableHead
                className="border-0 cursor-pointer select-none hover:text-brand whitespace-nowrap"
                onClick={() => toggleSort('label')}
              >
                {dimension}
                <HeaderSort column="label" />
              </TableHead>
              <TableHead
                className="text-end border-0 cursor-pointer select-none hover:text-brand whitespace-nowrap"
                onClick={() => toggleSort('value')}
              >
                {resolvedValueLabel}
                <HeaderSort column="value" />
              </TableHead>
              <TableHead
                className="text-end border-0 cursor-pointer select-none hover:text-brand whitespace-nowrap"
                onClick={() => toggleSort('share')}
              >
                {translate('Share')}
                <HeaderSort column="share" />
              </TableHead>
              {hasChanges && (
                <TableHead
                  className="text-end border-0 cursor-pointer select-none hover:text-brand whitespace-nowrap"
                  onClick={() => toggleSort('change')}
                >
                  {translate('Change')}
                  <HeaderSort column="change" />
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody className="border-0">
            {sortedData.map((item) => (
              <DrillDownRow
                key={item.id}
                item={item}
                dimension={dimension}
                onDrillDown={onDrillDown}
                showChange={hasChanges}
                valueLabel={valueLabel}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

/**
 * Why-So Drill-Down component for root cause analysis.
 * Uses a nested table layout for exploring data hierarchies.
 */
export const WhySoDrillDown: FC<WhySoDrillDownProps> = ({
  initialData,
  initialDimension,
  onDrillDown,
  valueLabel: initialValueLabel,
}) => {
  return (
    <div>
      {/* Header with data source */}
      <div className="flex justify-between items-center mb-3" />

      <div className="mb-3">
        <Card bordered className="overflow-hidden">
          <WhySoDrillDownTable
            data={initialData}
            dimension={initialDimension}
            onDrillDown={onDrillDown}
            isRoot
            valueLabel={initialValueLabel}
          />
        </Card>
      </div>
    </div>
  );
};
