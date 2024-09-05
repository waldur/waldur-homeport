import { Plus } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Button, Col } from 'react-bootstrap';

import { EChart } from '@waldur/core/EChart';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { SymbolsGroup } from '@waldur/customer/dashboard/SymbolsGroup';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { ChangesAmountBadge } from '@waldur/marketplace/service-providers/dashboard/ChangesAmountBadge';

import { Chart } from './types';
import { WidgetCard } from './WidgetCard';

interface TeamWidgetProps {
  api: () => Promise<{
    options: any[];
    totalItems: number;
  }>;
  chartData?: { chart: Chart; options };
  showChart?: boolean;
  scope: { url?: string; uuid?: string };
  onBadgeClick?(): void;
  onAddClick?(): void;
  showAdd?: boolean;
  className?: string;
  nameKey?: string;
  emailKey?: string;
  imageKey?: string;
}

export const TeamWidget: FC<TeamWidgetProps> = ({
  api,
  chartData,
  showChart,
  scope,
  onBadgeClick,
  onAddClick,
  showAdd = true,
  className,
  nameKey,
  emailKey,
  imageKey,
}) => {
  const { data, isLoading, error, refetch } = useQuery(
    ['TeamWidget', scope?.uuid],
    api,
    { staleTime: 3 * 60 * 1000 },
  );

  const count = data?.totalItems ?? 0;

  return (
    <WidgetCard
      className={className}
      cardTitle={translate('Team size')}
      title={
        count == 0
          ? translate('No members')
          : count === 1
            ? translate('1 member')
            : translate('{count} members', { count })
      }
      meta={
        chartData?.chart?.changes
          ? translate(
              '{changes} vs last month',
              {
                changes: (
                  <ChangesAmountBadge
                    changes={chartData.chart.changes}
                    showOnInfinity
                    showOnZero
                    asBadge={false}
                  />
                ),
              },
              formatJsxTemplate,
            )
          : null
      }
      right={
        <Col xs="auto" className="d-flex gap-3">
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <LoadingErred
              loadData={refetch}
              message={translate('Unable to load users')}
            />
          ) : data.options.length ? (
            <SymbolsGroup
              items={data.options}
              max={5}
              onClick={onBadgeClick}
              size={40}
              length={data.totalItems}
              nameKey={nameKey}
              emailKey={emailKey}
              imageKey={imageKey}
            />
          ) : null}
          {showAdd && (
            <div>
              <Button
                variant="outline"
                className="btn-icon btn-outline-dashed border-2 btn-color-muted btn-active-color-primary btn-circle w-40px h-40px"
                onClick={onAddClick}
              >
                <Plus size={18} weight="bold" />
              </Button>
            </div>
          )}
        </Col>
      }
    >
      {showChart && Boolean(chartData) && (
        <EChart options={chartData.options} height="68px" />
      )}
    </WidgetCard>
  );
};
