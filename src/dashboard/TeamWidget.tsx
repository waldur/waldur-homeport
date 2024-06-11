import { Plus } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { Button, Col } from 'react-bootstrap';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { SymbolsGroup } from '@waldur/customer/dashboard/SymbolsGroup';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { ChangesAmountBadge } from '@waldur/marketplace/service-providers/dashboard/ChangesAmountBadge';

import { WidgetCard } from './WidgetCard';

interface TeamWidgetProps {
  api: () => Promise<{
    options: any[];
    totalItems: number;
  }>;
  scope: { url?: string; uuid?: string };
  /** Number of users increased/decreased this month */
  changes?: number;
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
  scope,
  changes,
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

  const changesPercent = useMemo(() => {
    if (!changes || !data?.totalItems) return 0;
    return (changes / (data.totalItems - changes)) * 100;
  }, [changes, data?.totalItems]);

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
        changesPercent
          ? translate(
              '{changes} vs last month',
              {
                changes: (
                  <ChangesAmountBadge
                    changes={changesPercent}
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
    >
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
    </WidgetCard>
  );
};
