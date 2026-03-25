import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import {
  CourseAccount,
  CourseAccountStateEnum,
  marketplaceCourseAccountsList,
} from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';
import { renderFieldOrDash } from '@waldur/table/utils';

const stateConfig: Record<string, { label: string; color: string }> = {
  Pending: { label: translate('Pending'), color: 'warning' },
  OK: { label: translate('OK'), color: 'success' },
  Erred: { label: translate('Erred'), color: 'danger' },
  Closed: { label: translate('Closed'), color: 'default' },
};

interface Step3CreationProgressProps {
  createdAccounts: CourseAccount[];
  projectUuid: string;
}

export const Step3CreationProgress: FC<Step3CreationProgressProps> = ({
  createdAccounts,
  projectUuid,
}) => {
  const createdUuids = useMemo(
    () => new Set(createdAccounts.map((a) => a.uuid)),
    [createdAccounts],
  );

  const {
    data: polledAccounts,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['CourseAccountsBulkProgress', projectUuid],
    queryFn: async () => {
      const response = await marketplaceCourseAccountsList({
        query: {
          project_uuid: projectUuid,
          page_size: createdUuids.size || 100,
        },
      });
      return response.data;
    },
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 3000;
      const relevant = data.filter((a) => createdUuids.has(a.uuid));
      const anyPending = relevant.some((a) => a.state === 'Pending');
      return anyPending ? 3000 : false;
    },
    enabled: createdUuids.size > 0,
  });

  const accounts = useMemo(() => {
    if (!polledAccounts) return createdAccounts;
    const polledMap = new Map(polledAccounts.map((a) => [a.uuid, a]));
    return createdAccounts.map((a) => polledMap.get(a.uuid) || a);
  }, [createdAccounts, polledAccounts]);

  const sortedAccounts = useMemo(() => {
    const order: Record<CourseAccountStateEnum, number> = {
      Erred: 0,
      Pending: 1,
      OK: 2,
      Closed: 3,
    };
    return [...accounts].sort(
      (a, b) => (order[a.state] ?? 99) - (order[b.state] ?? 99),
    );
  }, [accounts]);

  const counts = useMemo(() => {
    const result = { Pending: 0, OK: 0, Erred: 0 };
    accounts.forEach((a) => {
      if (a.state in result) result[a.state]++;
    });
    return result;
  }, [accounts]);

  if (isLoading && !polledAccounts) {
    return <LoadingSpinner />;
  }

  if (!createdAccounts.length) {
    return (
      <p className="text-muted text-center">
        {translate('No accounts were created.')}
      </p>
    );
  }

  return (
    <div>
      <div className="d-flex gap-3 mb-4 align-items-center">
        {counts.Pending > 0 && (
          <Badge variant="warning" pill outline>
            {translate('{n} Pending', { n: counts.Pending })}
          </Badge>
        )}
        {counts.OK > 0 && (
          <Badge variant="success" pill outline>
            {translate('{n} Created', { n: counts.OK })}
          </Badge>
        )}
        {counts.Erred > 0 && (
          <Badge variant="danger" pill outline>
            {translate('{n} Failed', { n: counts.Erred })}
          </Badge>
        )}
        <ActionButton
          title={translate('Refresh')}
          action={() => refetch()}
          iconNode={<ArrowsClockwiseIcon weight="bold" />}
          variant="tertiary"
          disabled={isFetching}
          disabledReason={translate('Refreshing...')}
          className="ms-auto"
        />
      </div>
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead>
            <tr>
              <th>{translate('Email')}</th>
              <th>{translate('State')}</th>
              <th>{translate('Error')}</th>
            </tr>
          </thead>
          <tbody>
            {sortedAccounts.map((account) => {
              const config = stateConfig[account.state] || stateConfig.Pending;
              return (
                <tr key={account.uuid}>
                  <td>{renderFieldOrDash(account.email)}</td>
                  <td>
                    <Badge variant={config.color} pill outline>
                      {config.label}
                    </Badge>
                  </td>
                  <td>{renderFieldOrDash(account.error_message)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
