import { Plus } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { Button, Card, Col, Row } from 'react-bootstrap';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { SymbolsGroup } from '@waldur/customer/dashboard/SymbolsGroup';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { ChangesAmountBadge } from '@waldur/marketplace/service-providers/dashboard/ChangesAmountBadge';

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
    <Card className={className}>
      <Card.Body className="d-flex flex-column">
        <Card.Title as="div" className="fw-bold flex-grow-1 h4 mb-7">
          {translate('Team size')}
        </Card.Title>
        <Row className="align-items-center justify-content-between mt-auto gap-4">
          <Col>
            <Row className="align-items-center gap-4">
              <h1 className="mb-0 text-nowrap fs-1x col col-sm-12 col-md col-xxl-12">
                {count == 0
                  ? translate('No members')
                  : count === 1
                    ? translate('1 member')
                    : translate('{count} members', { count })}
              </h1>
              {changesPercent !== 0 && (
                <Col xs="auto" className="text-gray-700 text-nowrap fs-6">
                  {translate(
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
                  )}
                </Col>
              )}
            </Row>
          </Col>
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
        </Row>
      </Card.Body>
    </Card>
  );
};
