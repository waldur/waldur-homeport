import { useQuery } from '@tanstack/react-query';
import { FC, useEffect, useMemo, useRef } from 'react';
import { Field, Form } from 'react-final-form';
import {
  User,
  chatQuotaUsageRetrieve,
  chatQuotaSetQuota,
  TokenQuotaUsageResponse,
} from 'waldur-js-client';

import { UI_STALE_TIME } from '@/core/constants';
import { formatDateTime } from '@/core/dateUtils';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { NumberField } from '@/form';
import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { QuotaProgressBar } from '@/marketplace/resources/details/QuotaProgressBar';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';

interface FormValues {
  daily_limit: number | null;
  weekly_limit: number | null;
  monthly_limit: number | null;
}

export const calculateQuotaPercentage = (
  usage: number,
  userLimit: number | null,
  defaultLimit: number,
): number | null => {
  if (userLimit == null) userLimit = defaultLimit;
  if (userLimit === -1) return null;
  if (userLimit === 0) return 100;
  const percentage = Math.round((usage / userLimit) * 100);
  return Math.min(percentage, 100);
};

const parseNullableNumber = (value: any): number | null => {
  return value === '' || value === null ? null : Number(value);
};

const formatLimit = (limit: number | null, defaultLimit: number): string => {
  if (limit === null) {
    if (defaultLimit === -1) return translate('System default (Unlimited)');
    return `${translate('System default')} (${defaultLimit})`;
  }
  if (limit === -1) return 'Unlimited';
  return String(limit);
};

interface QuotaUsageRow {
  id: string;
  period: string;
  usage: number;
  limit: string;
  remaining: number | null;
  usagePercentage: number | null;
  resetAt: string;
}

const renderUsageCell = (percentage: number | null) => {
  if (percentage === null) {
    return <span className="text-muted">{DASH_ESCAPE_CODE}</span>;
  }
  return (
    <div className="d-flex align-items-center gap-2">
      <QuotaProgressBar
        percent={percentage}
        height={6}
        className="flex-grow-1"
      />
      <span className="text-nowrap" style={{ minWidth: '40px' }}>
        {percentage}%
      </span>
    </div>
  );
};

const renderRemainingCell = (remaining: number | null) => {
  if (remaining === null) {
    return <span className="text-muted">Unlimited</span>;
  }
  return <>{remaining.toLocaleString()}</>;
};

const QuotaUsageDisplay: FC<{ quota: TokenQuotaUsageResponse }> = ({
  quota,
}) => {
  const rows: QuotaUsageRow[] = useMemo(() => {
    const dailyPercentage = calculateQuotaPercentage(
      quota.daily_usage,
      quota.daily_limit,
      quota.daily_system_default,
    );
    const weeklyPercentage = calculateQuotaPercentage(
      quota.weekly_usage,
      quota.weekly_limit,
      quota.weekly_system_default,
    );
    const monthlyPercentage = calculateQuotaPercentage(
      quota.monthly_usage,
      quota.monthly_limit,
      quota.monthly_system_default,
    );

    return [
      {
        id: 'daily',
        period: translate('Daily'),
        usage: quota.daily_usage,
        limit: formatLimit(quota.daily_limit, quota.daily_system_default),
        remaining: quota.daily_remaining,
        usagePercentage: dailyPercentage,
        resetAt: quota.daily_reset_at,
      },
      {
        id: 'weekly',
        period: translate('Weekly'),
        usage: quota.weekly_usage,
        limit: formatLimit(quota.weekly_limit, quota.weekly_system_default),
        remaining: quota.weekly_remaining,
        usagePercentage: weeklyPercentage,
        resetAt: quota.weekly_reset_at,
      },
      {
        id: 'monthly',
        period: translate('Monthly'),
        usage: quota.monthly_usage,
        limit: formatLimit(quota.monthly_limit, quota.monthly_system_default),
        remaining: quota.monthly_remaining,
        usagePercentage: monthlyPercentage,
        resetAt: quota.monthly_reset_at,
      },
    ];
  }, [quota]);

  const columns: Column<QuotaUsageRow>[] = useMemo(
    () => [
      {
        title: translate('Period'),
        render: ({ row }) => <span className="fw-semibold">{row.period}</span>,
        id: 'period',
      },
      {
        title: translate('Usage'),
        render: ({ row }) => <>{row.usage.toLocaleString()}</>,
        id: 'usage',
      },
      {
        title: translate('Limit'),
        render: ({ row }) => <>{row.limit}</>,
        id: 'limit',
      },
      {
        title: translate('Remaining'),
        render: ({ row }) => renderRemainingCell(row.remaining),
        id: 'remaining',
      },
      {
        title: translate('Usage %'),
        render: ({ row }) => renderUsageCell(row.usagePercentage),
        id: 'usage_percentage',
      },
      {
        title: translate('Resets at'),
        render: ({ row }) => <>{formatDateTime(row.resetAt)}</>,
        id: 'reset_at',
      },
    ],
    [],
  );

  const tableProps = useTable({
    table: 'quotaUsage',
    fetchData: () =>
      Promise.resolve({
        rows,
        resultCount: rows.length,
      }),
    queryField: 'query',
  });

  return (
    <Table
      {...tableProps}
      rows={rows}
      columns={columns}
      rowKey="id"
      hasPagination={false}
      hasQuery={false}
      hasActionBar={false}
      cardBordered
      hoverShadow={false}
      bodyClassName="p-0"
      minHeight="auto"
      className="mb-1"
    />
  );
};

interface AITokenUsageFormProps {
  row: User;
  refetch: () => void;
  isTableRefreshing: boolean;
}

export const AITokenExpandableRow: FC<AITokenUsageFormProps> = ({
  row,
  refetch,
  isTableRefreshing,
}) => {
  const {
    data: quota,
    isLoading,
    error,
    refetch: refetchQuota,
  } = useQuery({
    queryKey: ['chatQuota', row.uuid],
    queryFn: () =>
      chatQuotaUsageRetrieve({ query: { user_uuid: row.uuid } }).then(
        (r) => r.data,
      ),
    staleTime: UI_STALE_TIME,
  });

  const prevRefreshingRef = useRef(false);

  // Sync local query when table is refreshing
  useEffect(() => {
    if (isTableRefreshing && !prevRefreshingRef.current) {
      refetchQuota();
    }
    prevRefreshingRef.current = isTableRefreshing;
  }, [isTableRefreshing, refetchQuota]);

  const { mutateAsync: handleSubmit } = useManagedMutation<
    any,
    any,
    FormValues
  >({
    mutationFn: async (values) => {
      await chatQuotaSetQuota({
        body: {
          user_uuid: row.uuid,
          daily_limit: values.daily_limit,
          weekly_limit: values.weekly_limit,
          monthly_limit: values.monthly_limit,
        },
      });
    },
    successMessage: translate('Token quota has been updated.'),
    errorMessage: translate('Unable to update token quota.'),
    refetch,
    onSuccess: () => {
      refetchQuota();
    },
  });

  const initialValues: FormValues = {
    daily_limit: quota?.daily_limit ?? null,
    weekly_limit: quota?.weekly_limit ?? null,
    monthly_limit: quota?.monthly_limit ?? null,
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-danger">
        {translate('Failed to load quota information.')}
      </div>
    );
  }

  const systemDefaultPlaceholder: Record<string, string> = {
    daily: quota ? formatLimit(null, quota.daily_system_default) : '',
    weekly: quota ? formatLimit(null, quota.weekly_system_default) : '',
    monthly: quota ? formatLimit(null, quota.monthly_system_default) : '',
  };

  return (
    <ExpandableContainer>
      <h4 className="mb-4">
        {`${translate('AI assistant token usage for')} ${row.full_name || row.username}`}
      </h4>
      {quota && <QuotaUsageDisplay quota={quota} />}

      <small className="text-muted">
        {translate(
          'Leave empty for system default. Use -1 for unlimited. Non-negative number for specific limit.',
        )}
      </small>

      <Form<FormValues>
        onSubmit={(values) => handleSubmit(values)}
        initialValues={initialValues}
        render={({ handleSubmit, submitting, pristine }) => (
          <form className="mt-6" onSubmit={handleSubmit}>
            <h5 className="mb-3">{translate('Set new limits')}</h5>

            <div className="row">
              <div className="col-md-4">
                <FormGroup
                  label={translate('Daily limit')}
                  description={translate(
                    'Empty = system default, -1 = unlimited',
                  )}
                >
                  <Field
                    name="daily_limit"
                    component={NumberField}
                    placeholder={systemDefaultPlaceholder.daily}
                    min={-1}
                    max={Number.MAX_SAFE_INTEGER}
                    parse={parseNullableNumber}
                  />
                </FormGroup>
              </div>
              <div className="col-md-4">
                <FormGroup
                  label={translate('Weekly limit')}
                  description={translate(
                    'Empty = system default, -1 = unlimited',
                  )}
                >
                  <Field
                    name="weekly_limit"
                    component={NumberField}
                    placeholder={systemDefaultPlaceholder.weekly}
                    min={-1}
                    max={Number.MAX_SAFE_INTEGER}
                    parse={parseNullableNumber}
                  />
                </FormGroup>
              </div>
              <div className="col-md-4">
                <FormGroup
                  label={translate('Monthly limit')}
                  description={translate(
                    'Empty = system default, -1 = unlimited',
                  )}
                >
                  <Field
                    name="monthly_limit"
                    component={NumberField}
                    placeholder={systemDefaultPlaceholder.monthly}
                    min={-1}
                    max={Number.MAX_SAFE_INTEGER}
                    parse={parseNullableNumber}
                  />
                </FormGroup>
              </div>
            </div>

            <div className="mt-4">
              <SubmitButton
                submitting={submitting}
                disabled={pristine || submitting}
                label={translate('Save')}
                className="btn btn-primary"
              />
            </div>
          </form>
        )}
      />
    </ExpandableContainer>
  );
};
