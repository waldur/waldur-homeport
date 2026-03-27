import {
  CaretDownIcon,
  TrendDownIcon,
  TrendUpIcon,
} from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, useCallback, useMemo, useState } from 'react';
import { Card, Table } from 'react-bootstrap';

import { Badge } from '@waldur/core/Badge';
import { CaretUpDownButtons } from '@waldur/core/CaretUpDownButtons';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';

import { MockDataIndicator } from './MockDataIndicator';
import { DataSourceType, DrillDownDataItem } from './types';

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
  /** Data source indicator */
  dataSource?: DataSourceType;
  /** Description of data source */
  dataSourceDescription?: string;
  /** Custom label for the 'Value' column */
  valueLabel?: string | ((total: number) => string);
  /** Title for the analysis */
  title?: string;
}

const DrillDownChange: FC<{ change?: DrillDownDataItem['change'] }> = ({
  change,
}) => {
  if (!change) {
    return <span className="text-muted">—</span>;
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
      pill
      outline
      className={classNames(
        'd-inline-flex align-items-center gap-1',
        changeDirection === 'stable' && 'text-muted',
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
      <tr
        className={classNames(
          item.canDrillDown && 'cursor-pointer hover-bg-light',
          isExpanded && 'bg-light',
        )}
        onClick={toggleExpand}
      >
        <td className={classNames('d-flex align-items-center gap-2')}>
          <div
            style={{ width: '20px' }}
            className="d-flex justify-content-center"
          >
            {item.canDrillDown && (
              <CaretDownIcon
                weight="bold"
                style={{
                  transform: isExpanded ? 'none' : 'rotate(-90deg)',
                  transition: 'transform 0.2s',
                }}
              />
            )}
          </div>
          <span className={item.canDrillDown ? 'fw-semibold' : ''}>
            {item.renderLabel ? item.renderLabel(item) : item.label}
          </span>
        </td>
        <td className="text-end">
          <span className="fw-semibold">{item.value.toLocaleString()}</span>
        </td>
        <td className="text-end" style={{ width: '100px' }}>
          <span className="text-muted">{item.percentage.toFixed(1)}%</span>
        </td>
        {showChange && (
          <td className="text-end" style={{ width: '100px' }}>
            <DrillDownChange change={item.change} />
          </td>
        )}
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={showChange ? 4 : 3} className="p-0 border-0">
            <div className="ps-5 pt-0 pb-3 pe-4">
              {isLoading ? (
                <div className="py-4 text-center">
                  <LoadingSpinner />
                </div>
              ) : error ? (
                <div className="py-2">
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
                <div className="py-2">
                  <NoResult
                    title={translate('No details available')}
                    message={translate('No further breakdown for this item.')}
                    noAction
                  />
                </div>
              )}
            </div>
          </td>
        </tr>
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
          sortColumn === column && sortOrder === 'asc' && 'text-primary',
        )}
        downClassName={classNames(
          sortColumn === column && sortOrder === 'desc' && 'text-primary',
        )}
        className="ms-1"
      />
    );
  };

  return (
    <div className="expandable-container py-3">
      <Table
        hover
        responsive={isRoot}
        className={classNames(
          'table-row-bordered table-rounded border mb-0',
          !isRoot && 'fs-7',
        )}
      >
        <thead>
          <tr className="text-muted fs-8 text-uppercase fw-bold border-bottom">
            <th
              className={classNames(
                'border-0 cursor-pointer user-select-none hover-text-primary text-nowrap',
              )}
              onClick={() => toggleSort('label')}
            >
              {dimension}
              <HeaderSort column="label" />
            </th>
            <th
              className="text-end border-0 cursor-pointer user-select-none hover-text-primary text-nowrap"
              onClick={() => toggleSort('value')}
            >
              {resolvedValueLabel}
              <HeaderSort column="value" />
            </th>
            <th
              className="text-end border-0 cursor-pointer user-select-none hover-text-primary text-nowrap"
              onClick={() => toggleSort('share')}
            >
              {translate('Share')}
              <HeaderSort column="share" />
            </th>
            {hasChanges && (
              <th
                className="text-end border-0 cursor-pointer user-select-none hover-text-primary text-nowrap"
                onClick={() => toggleSort('change')}
              >
                {translate('Change')}
                <HeaderSort column="change" />
              </th>
            )}
          </tr>
        </thead>
        <tbody className="border-0">
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
        </tbody>
      </Table>
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
  dataSource = 'real',
  dataSourceDescription,
  valueLabel: initialValueLabel,
}) => {
  return (
    <div className="why-so-drill-down">
      {/* Header with data source */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <MockDataIndicator
          source={dataSource}
          description={dataSourceDescription}
        />
      </div>

      <div className="mb-4">
        <Card className="card-bordered overflow-hidden">
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
