import {
  CaretRightIcon,
  HouseIcon,
  TrendDownIcon,
  TrendUpIcon,
} from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, useCallback, useMemo, useState } from 'react';
import { Breadcrumb, Card, ProgressBar, Table } from 'react-bootstrap';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';

import { MockDataIndicator } from './MockDataIndicator';
import {
  DataSourceType,
  DrillDownBreadcrumb,
  DrillDownDataItem,
  DrillDownLevel,
} from './types';

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
  /** Title for the analysis */
  title?: string;
}

/**
 * Single row in the drill-down table
 */
const DrillDownRow: FC<{
  item: DrillDownDataItem;
  maxValue: number;
  onDrillDown: () => void;
}> = ({ item, maxValue, onDrillDown }) => {
  const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
  const changeDirection = item.change?.direction;

  return (
    <tr
      className={classNames(
        item.canDrillDown && 'cursor-pointer hover-bg-light',
      )}
      onClick={item.canDrillDown ? onDrillDown : undefined}
    >
      <td className="d-flex align-items-center gap-2">
        {item.canDrillDown && (
          <CaretRightIcon weight="bold" className="text-primary" />
        )}
        <span className={item.canDrillDown ? 'text-primary fw-semibold' : ''}>
          {item.label}
        </span>
      </td>
      <td className="text-end">
        <span className="fw-semibold">{item.value.toLocaleString()}</span>
      </td>
      <td style={{ width: '200px' }}>
        <ProgressBar
          now={percentage}
          variant="primary"
          style={{ height: '8px' }}
        />
      </td>
      <td className="text-end">
        <span className="text-muted">{item.percentage.toFixed(1)}%</span>
      </td>
      {item.change && (
        <td className="text-end">
          <span
            className={classNames(
              'd-inline-flex align-items-center gap-1',
              changeDirection === 'up' && 'text-danger',
              changeDirection === 'down' && 'text-success',
              changeDirection === 'stable' && 'text-muted',
            )}
          >
            {changeDirection === 'up' && <TrendUpIcon weight="bold" />}
            {changeDirection === 'down' && <TrendDownIcon weight="bold" />}
            {item.change.percent > 0 ? '+' : ''}
            {item.change.percent.toFixed(1)}%
          </span>
        </td>
      )}
    </tr>
  );
};

/**
 * Why-So Drill-Down component for root cause analysis.
 * Allows users to navigate from aggregated data to detailed breakdowns.
 */
export const WhySoDrillDown: FC<WhySoDrillDownProps> = ({
  initialData,
  initialDimension,
  onDrillDown,
  dataSource = 'real',
  dataSourceDescription,
  title,
}) => {
  // Navigation state
  const [levels, setLevels] = useState<DrillDownLevel[]>([
    {
      id: 'root',
      label: initialDimension,
      dimension: initialDimension,
      data: initialData,
      breadcrumb: [],
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentLevel = levels[levels.length - 1];
  const hasChanges = currentLevel.data.some((item) => item.change);
  const maxValue = useMemo(
    () => Math.max(...currentLevel.data.map((item) => item.value), 0),
    [currentLevel.data],
  );

  // Handle drilling into an item
  const handleDrillDown = useCallback(
    async (item: DrillDownDataItem) => {
      if (!item.canDrillDown) return;

      setIsLoading(true);
      setError(null);

      try {
        const result = await onDrillDown(item, currentLevel.dimension);
        if (result) {
          const newBreadcrumb: DrillDownBreadcrumb[] = [
            ...currentLevel.breadcrumb,
            {
              id: item.id,
              label: item.label,
              dimension: currentLevel.dimension,
            },
          ];

          setLevels((prev) => [
            ...prev,
            {
              id: item.id,
              label: result.dimension,
              dimension: result.dimension,
              data: result.data,
              breadcrumb: newBreadcrumb,
            },
          ]);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : translate('Failed to load data'),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [currentLevel, onDrillDown],
  );

  // Handle navigation via breadcrumb
  const navigateToLevel = useCallback((index: number) => {
    setLevels((prev) => prev.slice(0, index + 1));
    setError(null);
  }, []);

  // Calculate totals
  const total = useMemo(
    () => currentLevel.data.reduce((sum, item) => sum + item.value, 0),
    [currentLevel.data],
  );

  return (
    <div className="why-so-drill-down">
      {/* Header with data source */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h6 className="mb-0">{title || translate('Root cause analysis')}</h6>
        <MockDataIndicator
          source={dataSource}
          description={dataSourceDescription}
        />
      </div>

      {/* Breadcrumb navigation */}
      {levels.length > 1 && (
        <Breadcrumb className="mb-3">
          <Breadcrumb.Item onClick={() => navigateToLevel(0)}>
            <HouseIcon weight="bold" className="me-1" />
            {initialDimension}
          </Breadcrumb.Item>
          {currentLevel.breadcrumb.map((crumb, index) => (
            <Breadcrumb.Item
              key={crumb.id}
              active={index === currentLevel.breadcrumb.length - 1}
              onClick={
                index < currentLevel.breadcrumb.length - 1
                  ? () => navigateToLevel(index + 1)
                  : undefined
              }
            >
              {crumb.label}
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
      )}

      {/* Current dimension */}
      <div className="mb-3">
        <span className="text-muted">{translate('Viewing by')}:</span>
        <span className="fw-semibold ms-2">{currentLevel.dimension}</span>
        <span className="text-muted ms-3">
          ({translate('Total')}: {total.toLocaleString()})
        </span>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-5">
          <LoadingSpinner />
        </div>
      )}

      {/* Error state */}
      {error && (
        <LoadingErred
          message={error}
          loadData={() => {
            setError(null);
          }}
        />
      )}

      {/* Data table */}
      {!isLoading && !error && (
        <Card>
          <Table hover className="mb-0">
            <thead>
              <tr>
                <th>{currentLevel.dimension}</th>
                <th className="text-end">{translate('Value')}</th>
                <th>{translate('Distribution')}</th>
                <th className="text-end">{translate('Share')}</th>
                {hasChanges && (
                  <th className="text-end">{translate('Change')}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {currentLevel.data.map((item) => (
                <DrillDownRow
                  key={item.id}
                  item={item}
                  maxValue={maxValue}
                  onDrillDown={() => handleDrillDown(item)}
                />
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      {/* Empty state */}
      {!isLoading && !error && currentLevel.data.length === 0 && (
        <NoResult
          title={translate('No data available')}
          message={translate('No data available at this level.')}
          noAction
        />
      )}

      {/* Drill-down hint */}
      {currentLevel.data.some((item) => item.canDrillDown) && (
        <div className="text-muted small mt-3">
          <CaretRightIcon weight="bold" className="me-1" />
          {translate('Click on a row to drill down for more details')}
        </div>
      )}
    </div>
  );
};
